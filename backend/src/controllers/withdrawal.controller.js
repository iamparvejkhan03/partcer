import mongoose from "mongoose";
import Withdrawal from "../models/withdrawal.model.js";
import NewOrder from "../models/newOrder.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import PaymentDetail from "../models/paymentDetail.model.js";
import { withdrawalCancellationAdminNotification, withdrawalRequestAdminNotification, withdrawalStatusUpdateEmail } from "../utils/emailTemplates.js";
import transporter from "../utils/nodemailer.js";

const generateWithdrawalId = () => {
    return `WD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// Get freelancer's earnings summary and balance
const getEarningsSummary = asyncHandler(async (req, res) => {
    const freelancerId = req.user.id;

    // Get balance from user model method
    const balance = await req.user.calculateAvailableBalance();

    // Get this month's earnings
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthEarnings = await NewOrder.aggregate([
        {
            $match: {
                mentorId: new mongoose.Types.ObjectId(freelancerId),
                paymentStatus: "paid",
                createdAt: { $gte: startOfMonth }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$mentorFee" },
                count: { $sum: 1 }
            }
        }
    ]);

    // Get last month's earnings
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const lastMonthEarnings = await NewOrder.aggregate([
        {
            $match: {
                mentorId: new mongoose.Types.ObjectId(freelancerId),
                paymentStatus: "paid",
                createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$mentorFee" }
            }
        }
    ]);

    // Get total orders and completed orders
    const totalOrders = await NewOrder.countDocuments({ mentorId: freelancerId });
    const completedOrders = await NewOrder.countDocuments({
        mentorId: freelancerId,
        paymentStatus: "paid",
        orderStatus: "completed"
    });

    // Get average order value
    const avgOrderResult = await NewOrder.aggregate([
        {
            $match: {
                mentorId: new mongoose.Types.ObjectId(freelancerId),
                paymentStatus: "paid"
            }
        },
        {
            $group: {
                _id: null,
                avgValue: { $avg: "$mentorFee" }
            }
        }
    ]);

    // Get pending clearance (paid but not yet deliver completed)
    const pendingClearance = await NewOrder.aggregate([
        {
            $match: {
                mentorId: new mongoose.Types.ObjectId(freelancerId),
                paymentStatus: "paid",
                deliveryStatus: { $ne: "completed" }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$mentorFee" }
            }
        }
    ]);

    const cancellationRate = totalOrders > 0
        ? ((totalOrders - completedOrders) / totalOrders * 100).toFixed(1)
        : 0;

    return res.status(200).json(
        new ApiResponse(200, {
            totalEarned: balance.totalEarned,
            totalWithdrawn: balance.totalWithdrawn,
            available: balance.available,
            pending: balance.pendingWithdrawals,
            clearing: 0, // Can be calculated from pending withdrawals with "clearing" status
            lifetimeBalance: balance.totalEarned - balance.totalWithdrawn,
            thisMonth: thisMonthEarnings[0]?.total || 0,
            lastMonth: lastMonthEarnings[0]?.total || 0,
            avgOrderValue: avgOrderResult[0]?.avgValue || 0,
            totalOrders,
            completedOrders,
            cancellationRate: parseFloat(cancellationRate)
        }, "Earnings summary fetched successfully")
    );
});

// Get withdrawal history
const getWithdrawalHistory = asyncHandler(async (req, res) => {
    const freelancerId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { freelancerId };
    if (status && status !== "all") {
        query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const withdrawals = await Withdrawal.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await Withdrawal.countDocuments(query);

    // Format withdrawals for frontend
    const formattedWithdrawals = withdrawals.map(w => ({
        _id: w._id,
        id: w.withdrawalId,
        amount: w.amount,
        date: w.createdAt,
        method: w.method,
        methodDetails: w.methodDetails,
        status: w.status,
        orderId: "Multiple orders",
        transactionId: w.transactionId,
        processedDate: w.processedDate,
        notes: w.notes,
        cancellationReason: w.cancellationReason
    }));

    return res.status(200).json(
        new ApiResponse(200, {
            withdrawals: formattedWithdrawals,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }, "Withdrawal history fetched successfully")
    );
});

// Request a withdrawal
const requestWithdrawal = asyncHandler(async (req, res) => {
    const { amount, method, notes } = req.body;
    const freelancerId = req.user.id;

    // Validate amount
    if (!amount || amount < 10) {
        throw new ApiError(400, "Minimum withdrawal amount is $10");
    }

    // Check available balance
    const balance = await req.user.calculateAvailableBalance();

    if (amount > balance.available) {
        throw new ApiError(400, `Insufficient balance. Available: $${balance.available.toFixed(2)}`);
    }

    // Get UPI details from user's payment method
    const paymentDetail = await PaymentDetail.findOne({ userId: freelancerId, upiId: { $exists: true, $ne: null } });

    if (!paymentDetail || !paymentDetail.upiId) {
        throw new ApiError(400, "Please add payment method first");
    }

    const methodDetails = paymentDetail.upiId;

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
        withdrawalId: generateWithdrawalId(),
        freelancerId,
        amount,
        method,
        methodDetails,
        status: "pending",
        notes: notes || ""
    });

    const adminEmail = process.env.EMAIL_USER; // Set this in your .env

    if (adminEmail) {
        withdrawalRequestAdminNotification(transporter, adminEmail, withdrawal, req.user, paymentDetail.upiId)
            .catch(err => console.error(`Admin withdrawal notification failed: ${err.message}`));
    }

    return res.status(201).json(
        new ApiResponse(201, {
            id: withdrawal.withdrawalId,
            amount: withdrawal.amount,
            date: withdrawal.createdAt,
            method: withdrawal.method,
            methodDetails: withdrawal.methodDetails,
            status: withdrawal.status,
            notes: withdrawal.notes
        }, "Withdrawal request submitted successfully")
    );
});

// Cancel a withdrawal request (only if pending)
const cancelWithdrawal = asyncHandler(async (req, res) => {
    const { withdrawalId } = req.params;
    const freelancerId = req.user.id;
    console.log(withdrawalId)

    const withdrawal = await Withdrawal.findOne({
        _id: withdrawalId,
        freelancerId,
        status: "pending"
    });

    if (!withdrawal) {
        throw new ApiError(404, "Withdrawal request not found or cannot be cancelled");
    }

    withdrawal.status = "cancelled";
    withdrawal.cancellationReason = req.body?.reason || "Cancelled by user";

    await withdrawal.save();

    const adminEmail = process.env.EMAIL_USER;

    if (adminEmail) {
        const mentor = await User.findById(freelancerId).select("firstName lastName agencyName email");
        if (mentor) {
            const cancellationReason = withdrawal.cancellationReason;
            withdrawalCancellationAdminNotification(transporter, adminEmail, withdrawal, mentor, cancellationReason)
                .catch(err => console.error(`Admin withdrawal cancellation notification failed: ${err.message}`));
        }
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Withdrawal cancelled successfully")
    );
});

// ==================== ADMIN ROUTES ====================

// Get all withdrawals (admin)
const adminGetWithdrawals = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && status !== "all") {
        query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const withdrawals = await Withdrawal.find(query)
        .populate("freelancerId", "firstName lastName agencyName email displayName")
        .populate("processedBy", "firstName lastName agencyName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await Withdrawal.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            withdrawals,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }, "Withdrawals fetched successfully")
    );
});

// Process withdrawal (admin)
const processWithdrawal = asyncHandler(async (req, res) => {
    const { withdrawalId } = req.params;
    const { status, transactionId, notes } = req.body;

    if (!["clearing", "completed", "cancelled"].includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const withdrawal = await Withdrawal.findOne({ withdrawalId });

    if (!withdrawal) {
        throw new ApiError(404, "Withdrawal not found");
    }

    withdrawal.status = status;
    if (transactionId) withdrawal.transactionId = transactionId;
    if (notes) withdrawal.notes = notes;
    if (status === "completed" || status === "clearing") {
        withdrawal.processedDate = new Date();
        withdrawal.processedBy = req.user.id;
    }

    await withdrawal.save();

    const mentor = await User.findById(withdrawal.freelancerId).select("firstName lastName agencyName email");

    if (mentor) {
        const updateDetails = {
            status: withdrawal.status,
            transactionId: withdrawal.transactionId,
            notes: notes || withdrawal.notes,
            processedBy: req.user.id
        };

        withdrawalStatusUpdateEmail(transporter, mentor, withdrawal, updateDetails)
            .catch(err => console.error(`Withdrawal status email failed for ${mentor.email}:`, err.message));
    }

    return res.status(200).json(
        new ApiResponse(200, withdrawal, "Withdrawal processed successfully")
    );
});

export {
    getEarningsSummary,
    getWithdrawalHistory,
    requestWithdrawal,
    cancelWithdrawal,
    adminGetWithdrawals,
    processWithdrawal
};
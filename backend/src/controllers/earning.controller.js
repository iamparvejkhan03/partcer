import mongoose from "mongoose";
import NewOrder from "../models/newOrder.model.js";
import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate earnings summary for a freelancer/mentor
 */
const calculateEarningsSummary = async (mentorId, transactions = null) => {
    // If transactions not provided, fetch them
    let paidTransactions = transactions;
    if (!paidTransactions) {
        paidTransactions = await NewOrder.find({
            mentorId,
            paymentStatus: "paid"
        });
    }

    // Calculate totals
    const lifetimeEarnings = paidTransactions.reduce(
        (sum, t) => sum + (t.mentorFee || 0),
        0
    );

    // This month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthTransactions = paidTransactions.filter(
        t => new Date(t.createdAt) >= startOfMonth
    );
    const thisMonthEarnings = thisMonthTransactions.reduce(
        (sum, t) => sum + (t.mentorFee || 0),
        0
    );

    // This week
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const thisWeekTransactions = paidTransactions.filter(
        t => new Date(t.createdAt) >= startOfWeek
    );
    const thisWeekEarnings = thisWeekTransactions.reduce(
        (sum, t) => sum + (t.mentorFee || 0),
        0
    );

    // Average order value
    const avgOrderValue = paidTransactions.length > 0
        ? lifetimeEarnings / paidTransactions.length
        : 0;

    // Highest earning order
    const highestEarning = paidTransactions.length > 0
        ? Math.max(...paidTransactions.map(t => t.mentorFee || 0))
        : 0;

    return {
        lifetimeEarnings,
        thisMonth: thisMonthEarnings,
        thisWeek: thisWeekEarnings,
        avgOrderValue,
        totalTransactions: paidTransactions.length,
        highestEarning,
        averageProcessingTime: "2-3 days"
    };
};

/**
 * Format transaction for frontend
 */
const formatTransaction = (order, type = "credit") => {
    // Get customer info (student)
    const customer = order.studentId || {};

    return {
        id: order.orderId,
        orderId: order?._id,
        date: order.createdAt,
        customer: {
            id: customer._id,
            name: customer.displayName || customer?.agencyName || `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Unknown",
            avatar: customer.profileImage || null,
            email: customer.email || "",
            location: customer.city || customer.country || "",
            isVerified: customer.isVerified || false
        },
        service: {
            title: order.serviceType || "Consultation Session",
            category: getCategoryFromServiceType(order.serviceType),
            type: "service",
            package: order.durationDetails || order.duration || "Standard Package"
        },
        amount: order.amount || 0,
        fee: order.partnerFee || 0,
        netEarnings: order.mentorFee || 0,
        status: getTransactionStatus(order),
        paymentMethod: getPaymentMethod(order),
        processedDate: order.paymentCompletedAt || order.paymentAttemptedAt,
        clearingDate: order.deliveryDetails?.completedAt ||
            (order.orderStatus === "completed" ? order.updatedAt : null),
        invoice: `INV-${order.orderId || order._id}`,
        holdReason: order.errorDetails || null,
        cancellationReason: order.orderStatus === "cancelled" ? order.errorDetails || "Order cancelled" : null,
        period: order.period,
        duration: order.duration,
        deliveryStatus: order.deliveryStatus,
        orderStatus: order.orderStatus
    };
};

/**
 * Get category from service type
 */
const getCategoryFromServiceType = (serviceType) => {
    const categoryMap = {
        "Job Support (Mentoring)": "Mentoring & Career",
        "Skill Training": "Education & Training",
        "Mock Interview Support": "Career Preparation"
    };
    return categoryMap[serviceType] || "Professional Services";
};

/**
 * Get transaction status based on order statuses
 */
const getTransactionStatus = (order) => {
    if (order.paymentStatus === "paid") {
        return "paid";
    }
    if (order.paymentStatus === "pending" || order.paymentStatus === "created" || order.paymentStatus === "attempted") {
        return "pending";
    }
    if (order.orderStatus === "cancelled" || order.paymentStatus === "failed" || order.paymentStatus === "refunded") {
        return "cancelled";
    }
    return "pending";
};

/**
 * Get payment method from order
 */
const getPaymentMethod = (order) => {
    // Default to credit_card since Razorpay is used
    // Could be enhanced to store payment method in order
    return "credit_card";
};

// ==================== EARNING CONTROLLERS ====================

/**
 * Get freelancer/mentor earnings transactions
 * GET /api/v1/freelancer/earnings/transactions
 */
const getEarningsTransactions = asyncHandler(async (req, res) => {
    const mentorId = req.user.id;
    const {
        status,
        type,
        period,
        fromDate,
        toDate,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc"
    } = req.query;

    // Build query
    const query = { mentorId };

    // Filter by payment status
    if (status && status !== "all") {
        if (status === "cleared") {
            query.paymentStatus = "paid";
            query.deliveryStatus = "completed";
        } else if (status === "paid") {
            query.paymentStatus = "paid";
            query.deliveryStatus = { $ne: "completed" };
        } else if (status === "pending") {
            query.paymentStatus = "pending";
        } else if (status === "cancelled") {
            query.orderStatus = "cancelled";
        } else {
            query.paymentStatus = status;
        }
    }

    // Filter by date range
    if (fromDate || toDate) {
        query.createdAt = {};
        if (fromDate) query.createdAt.$gte = new Date(fromDate);
        if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    // Filter by period (One-time, Per day, Weekly, Monthly)
    if (period && period !== "all") {
        query.period = period;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // Fetch orders with student population
    const orders = await NewOrder.find(query)
        .populate("studentId", "firstName lastName agencyName displayName email profileImage city country isVerified")
        .populate("mentorId", "firstName lastName agencyName displayName email profileImage")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit));

    const total = await NewOrder.countDocuments(query);

    // Format transactions for frontend
    const transactions = orders.map(order => formatTransaction(order));

    // Calculate summary
    const allPaidOrders = await NewOrder.find({
        mentorId,
        paymentStatus: "paid"
    }).populate("studentId");

    const summary = await calculateEarningsSummary(mentorId, allPaidOrders);

    // Get monthly breakdown for chart
    const monthlyBreakdown = await NewOrder.aggregate([
        {
            $match: {
                mentorId: new mongoose.Types.ObjectId(mentorId),
                paymentStatus: "paid",
                deliveryStatus: "completed"
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" }
                },
                earnings: { $sum: "$mentorFee" },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 12 }
    ]);

    // Format monthly breakdown for frontend
    const formattedMonthlyBreakdown = monthlyBreakdown.map(item => ({
        month: new Date(item._id.year, item._id.month - 1, 1).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric"
        }),
        earnings: item.earnings,
        count: item.count
    }));

    return res.status(200).json(
        new ApiResponse(200, {
            transactions,
            summary,
            monthlyBreakdown: formattedMonthlyBreakdown,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        }, "Earnings transactions fetched successfully")
    );
});

/**
 * Get earnings summary only
 * GET /api/v1/freelancer/earnings/summary
 */
const getEarningsSummary = asyncHandler(async (req, res) => {
    const mentorId = req.user.id;

    const paidOrders = await NewOrder.find({
        mentorId,
        paymentStatus: "paid"
    }).populate("studentId");

    const summary = await calculateEarningsSummary(mentorId, paidOrders);

    return res.status(200).json(
        new ApiResponse(200, summary, "Earnings summary fetched successfully")
    );
});

/**
 * Get single transaction details
 * GET /api/v1/freelancer/earnings/transactions/:orderId
 */
const getTransactionDetails = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const mentorId = req.user.id;

    // Try to find by orderId string or _id
    let order = await NewOrder.findOne({
        mentorId,
        $or: [
            { orderId: orderId },
            { _id: mongoose.Types.ObjectId.isValid(orderId) ? orderId : null }
        ]
    })
        .populate("studentId", "firstName lastName agencyName displayName email profileImage city country isVerified")
        .populate("mentorId", "firstName lastName agencyName displayName email profileImage");

    if (!order && mongoose.Types.ObjectId.isValid(orderId)) {
        order = await NewOrder.findById(orderId)
            .populate("studentId", "firstName lastName agencyName displayName email profileImage city country isVerified")
            .populate("mentorId", "firstName lastName agencyName displayName email profileImage");
    }

    if (!order) {
        throw new ApiError(404, "Transaction not found");
    }

    // Check authorization
    if (order.mentorId._id.toString() !== mentorId.toString() && req.user.userType !== "admin") {
        throw new ApiError(403, "You don't have permission to view this transaction");
    }

    const transaction = formatTransaction(order);

    return res.status(200).json(
        new ApiResponse(200, { transaction, order }, "Transaction details fetched successfully")
    );
});

/**
 * Get earnings stats for dashboard
 * GET /api/v1/freelancer/earnings/stats
 */
const getEarningsStats = asyncHandler(async (req, res) => {
    const mentorId = req.user.id;

    // Get current month earnings
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const currentMonthEarnings = await NewOrder.aggregate([
        {
            $match: {
                mentorId: new mongoose.Types.ObjectId(mentorId),
                paymentStatus: "paid",
                deliveryStatus: "completed",
                createdAt: { $gte: startOfMonth, $lte: endOfMonth }
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

    // Get previous month earnings for comparison
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const previousMonthEarnings = await NewOrder.aggregate([
        {
            $match: {
                mentorId: new mongoose.Types.ObjectId(mentorId),
                paymentStatus: "paid",
                deliveryStatus: "completed",
                createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd }
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

    const currentTotal = currentMonthEarnings[0]?.total || 0;
    const previousTotal = previousMonthEarnings[0]?.total || 0;
    const percentChange = previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : currentTotal > 0 ? 100 : 0;

    // Get pending clearance amount
    const pendingClearance = await NewOrder.aggregate([
        {
            $match: {
                mentorId: new mongoose.Types.ObjectId(mentorId),
                paymentStatus: "paid",
                deliveryStatus: { $ne: "completed" },
                orderStatus: { $ne: "cancelled" }
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

    // Get upcoming expected earnings (active orders not yet delivered)
    const upcomingEarnings = await NewOrder.aggregate([
        {
            $match: {
                mentorId: new mongoose.Types.ObjectId(mentorId),
                paymentStatus: "paid",
                deliveryStatus: "pending",
                orderStatus: "confirmed"
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

    // Get total students/clients
    const uniqueStudents = await NewOrder.distinct("studentId", {
        mentorId,
        paymentStatus: "paid"
    });

    return res.status(200).json(
        new ApiResponse(200, {
            currentMonthEarnings: currentTotal,
            currentMonthOrders: currentMonthEarnings[0]?.count || 0,
            previousMonthEarnings: previousTotal,
            percentChange: Math.round(percentChange * 10) / 10,
            pendingClearance: pendingClearance[0]?.total || 0,
            pendingClearanceCount: pendingClearance[0]?.count || 0,
            upcomingEarnings: upcomingEarnings[0]?.total || 0,
            upcomingOrdersCount: upcomingEarnings[0]?.count || 0,
            totalClients: uniqueStudents.length,
            averageOrderValue: currentMonthEarnings[0]?.count > 0
                ? currentTotal / currentMonthEarnings[0].count
                : 0
        }, "Earnings stats fetched successfully")
    );
});

/**
 * Generate invoice for a transaction
 * GET /api/v1/freelancer/earnings/transactions/:orderId/invoice
 */
const generateInvoice = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const mentorId = req.user.id;

    let order = await NewOrder.findOne({
        mentorId,
        $or: [
            { orderId: orderId },
            { _id: mongoose.Types.ObjectId.isValid(orderId) ? orderId : null }
        ]
    })
        .populate("studentId", "firstName lastName agencyName displayName email profileImage city country")
        .populate("mentorId", "firstName lastName agencyName displayName email profileImage");

    if (!order && mongoose.Types.ObjectId.isValid(orderId)) {
        order = await NewOrder.findById(orderId)
            .populate("studentId", "firstName lastName agencyName displayName email profileImage city country")
            .populate("mentorId", "firstName lastName agencyName displayName email profileImage");
    }

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Check authorization
    if (order.mentorId._id.toString() !== mentorId.toString() && req.user.userType !== "admin") {
        throw new ApiError(403, "You don't have permission to generate invoice for this transaction");
    }

    // Build invoice data
    const invoiceData = {
        invoiceNumber: `INV-${order.orderId || order._id}`,
        orderId: order.orderId,
        date: order.createdAt,
        paidDate: order.paymentCompletedAt,

        // Mentor/Seller info
        mentor: {
            name: order.mentorId.displayName || `${order.mentorId.firstName} ${order.mentorId.lastName}`,
            email: order.mentorId.email,
            ...(order.mentorId.profileImage && { profileImage: order.mentorId.profileImage })
        },

        // Student/Buyer info
        student: {
            name: order.studentId.displayName || order.studentId.agencyName || `${order.studentId.firstName} ${order.studentId.lastName}`,
            email: order.studentId.email,
            location: [order.studentId.city, order.studentId.country].filter(Boolean).join(", ")
        },

        // Service details
        service: {
            type: order.serviceType,
            period: order.period,
            duration: order.duration,
            durationDetails: order.durationDetails
        },

        // Payment breakdown
        payment: {
            amount: order.amount,
            mentorFee: order.mentorFee,
            partnerFee: order.partnerFee,
            currency: order.currency || "INR"
        },

        // Status
        status: order.paymentStatus,
        deliveryStatus: order.deliveryStatus
    };

    // Here you would generate PDF invoice
    // For now, return the invoice data
    return res.status(200).json(
        new ApiResponse(200, invoiceData, "Invoice generated successfully")
    );
});

/**
 * Export earnings as CSV
 * GET /api/v1/freelancer/earnings/export
 */
const exportEarnings = asyncHandler(async (req, res) => {
    const mentorId = req.user.id;
    const { fromDate, toDate, format = "csv" } = req.query;

    const query = { mentorId, paymentStatus: "paid" };

    if (fromDate || toDate) {
        query.createdAt = {};
        if (fromDate) query.createdAt.$gte = new Date(fromDate);
        if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const orders = await NewOrder.find(query)
        .populate("studentId", "firstName lastName agencyName displayName email")
        .sort({ createdAt: -1 });

    const transactions = orders.map(order => formatTransaction(order));

    if (format === "csv") {
        // Create CSV
        const headers = [
            "Order ID", "Date", "Customer Name", "Customer Email",
            "Service Type", "Period", "Duration", "Gross Amount",
            "Platform Fee", "Net Earnings", "Status", "Payment Status"
        ];

        const rows = transactions.map(t => [
            t.id,
            new Date(t.date).toLocaleDateString(),
            t.customer.name,
            t.customer.email,
            t.service.title,
            t.period || "N/A",
            t.duration || "N/A",
            t.amount,
            t.fee,
            t.netEarnings,
            t.status,
            t.orderStatus
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=earnings_${Date.now()}.csv`);

        return res.status(200).send(csvContent);
    }

    // Return JSON
    return res.status(200).json(
        new ApiResponse(200, { transactions }, "Earnings exported successfully")
    );
});

/**
 * Get withdrawal history (for future implementation)
 * GET /api/v1/freelancer/earnings/withdrawals
 */
const getWithdrawalHistory = asyncHandler(async (req, res) => {
    // This would connect to a withdrawals collection
    // For now, return empty array
    return res.status(200).json(
        new ApiResponse(200, { withdrawals: [], totalWithdrawn: 0, availableBalance: 0 }, "Withdrawal history fetched")
    );
});

/**
 * Request withdrawal (for future implementation)
 * POST /api/v1/freelancer/earnings/withdraw
 */
const requestWithdrawal = asyncHandler(async (req, res) => {
    const { amount, method, accountDetails } = req.body;
    const mentorId = req.user.id;

    // Calculate available balance (paid orders not yet withdrawn)
    const paidOrders = await NewOrder.aggregate([
        {
            $match: {
                mentorId: new mongoose.Types.ObjectId(mentorId),
                paymentStatus: "paid",
                deliveryStatus: "completed"
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$mentorFee" }
            }
        }
    ]);

    const availableBalance = paidOrders[0]?.total || 0;

    if (amount > availableBalance) {
        throw new ApiError(400, "Insufficient balance for withdrawal");
    }

    // This would create a withdrawal request
    // For now, return success message
    return res.status(200).json(
        new ApiResponse(200, {
            amount,
            method,
            status: "pending",
            requestedAt: new Date()
        }, "Withdrawal request submitted successfully")
    );
});

export {
    getEarningsTransactions,
    getEarningsSummary,
    getTransactionDetails,
    getEarningsStats,
    generateInvoice,
    exportEarnings,
    getWithdrawalHistory,
    requestWithdrawal
};
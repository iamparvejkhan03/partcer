import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/newOrder.model.js";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import NewOrder from "../models/newOrder.model.js";
import Review from "../models/review.model.js";
import Resolution from "../models/resolution.model.js";
import { orderCompletedEmail, orderConfirmationForMentor, orderConfirmationForStudent, orderDeliveredEmail } from "../utils/emailTemplates.js";
import transporter from "../utils/nodemailer.js";
import { getIO } from '../sockets/socket.js';
import { checkAllSessionsApproved, initializeOrderSessions } from "./session.controller.js";
import { ApiError } from "../utils/ApiError.js";
import Session from "../models/session.model.js";

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Pricing configuration (matching your tables)
const pricingConfig = {
    one_time: {
        standard: {
            mentorFee: 1000,
            partnerFee: 300,
            learnerPays: 1300,
            duration: "Single session",
        },
    },
    per_day: {
        standard: {
            mentorFee: 1000,
            partnerFee: 200,
            learnerPays: 1200,
            duration: "Standard (2-3 hrs)",
        },
        full_day: {
            mentorFee: 2000,
            partnerFee: 300,
            learnerPays: 2300,
            duration: "Full day (6-8 hrs)",
        },
    },
    weekly: {
        standard: {
            mentorFee: 7500,
            partnerFee: 500,
            learnerPays: 8000,
            duration: "Standard (2-3 hrs/day) · min 5 sessions",
        },
        full_day: {
            mentorFee: 15000,
            partnerFee: 1000,
            learnerPays: 16000,
            duration: "Full day (6-8 hrs) · min 5 sessions",
        },
    },
    monthly: {
        standard: {
            mentorFee: 30000,
            partnerFee: 2000,
            learnerPays: 32000,
            duration: "Standard (2-3 hrs/day) · min 21 sessions",
        },
        full_day: {
            mentorFee: 60000,
            partnerFee: 3000,
            learnerPays: 63000,
            duration: "Full day (6-8 hrs) · min 21 sessions",
        },
    },
};

// Helper function to map period and duration to pricing
const getPricing = (period, duration) => {
    const periodMap = {
        "One-time": "one_time",
        "Per day": "per_day",
        Weekly: "weekly",
        Monthly: "monthly",
    };

    const durationMap = {
        "Single session": "standard",
        "Standard (2-3 hrs)": "standard",
        "Full day (6-8 hrs)": "full_day",
        "Standard (2-3 hrs/day) · min 5 sessions": "standard",
        "Full day (6-8 hrs) · min 5 sessions": "full_day",
        "Standard (2-3 hrs/day) · min 21 sessions": "standard",
        "Full day (6-8 hrs) · min 21 sessions": "full_day",
    };

    const periodKey = periodMap[period] || period;
    const durationKey = durationMap[duration] || duration;

    return pricingConfig[periodKey]?.[durationKey] || null;
};

// 1. Create Razorpay Order
// export const createOrder = asyncHandler(async (req, res) => {
//     const {
//         serviceType,
//         period,
//         duration,
//         mentorId,
//         amount,
//     } = req.body;

//     const studentId = req.user.id;

//     // Validate pricing
//     const pricing = getPricing(period, duration);
//     if (!pricing) {
//         return res.status(400).json(
//             new ApiResponse(400, null, "Invalid pricing configuration")
//         );
//     }

//     // Use provided amount or get from pricing
//     const finalAmount = amount || pricing.learnerPays;

//     // Create unique order ID
//     const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

//     // Create Razorpay order (amount in paise/cents)
//     const razorpayOrder = await razorpay.orders.create({
//         amount: finalAmount * 100, // Convert to paise
//         currency: "INR",
//         receipt: orderId,
//         notes: {
//             serviceType,
//             period,
//             duration,
//             mentorId,
//             studentId,
//             orderId,
//         },
//     });

//     // Save order to database
//     const order = await Order.create({
//         orderId,
//         razorpayOrderId: razorpayOrder.id,
//         studentId,
//         mentorId,
//         serviceType,
//         period,
//         duration,
//         durationDetails: pricing.duration,
//         amount: finalAmount,
//         mentorFee: pricing.mentorFee,
//         partnerFee: pricing.partnerFee,
//         paymentStatus: "created",
//         orderStatus: "pending",
//         notes: {
//             serviceType,
//             period,
//             duration,
//         },
//     });

//     // Create transaction record
//     await Transaction.create({
//         orderId: order._id,
//         razorpayOrderId: razorpayOrder.id,
//         amount: finalAmount,
//         status: "initiated",
//         transactionType: "payment",
//     });

//     return res.status(200).json(
//         new ApiResponse(200, {
//             order,
//             razorpayOrderId: razorpayOrder.id,
//             razorpayKeyId: process.env.RAZORPAY_KEY_ID,
//             amount: finalAmount,
//             currency: "INR",
//         }, "Order created successfully")
//     );
// });


// 1. Create Razorpay Order (UPDATED for multi-currency)
export const createOrder = asyncHandler(async (req, res) => {
    const {
        serviceType,
        period,
        duration,
        mentorId,
        studentPaidAmount,    // Amount in student's currency
        studentCurrency,      // "USD" or "INR"
        exchangeRateUsed,     // If USD, the rate used (e.g., 84.00)
        originalINRAmount,    // Original INR amount from pricing
        mentorFeeINR,         // Mentor fee in INR
        partnerFeeINR,        // Platform fee in INR
    } = req.body;

    const studentId = req.user.id;

    // Validate required fields
    if (!serviceType || !period || !duration || !mentorId || !studentPaidAmount || !studentCurrency) {
        return res.status(400).json(
            new ApiResponse(400, null, "Missing required fields")
        );
    }

    // For USD payments, exchange rate must be provided
    if (studentCurrency === "USD" && !exchangeRateUsed) {
        return res.status(400).json(
            new ApiResponse(400, null, "Exchange rate required for USD payments")
        );
    }

    // Calculate amounts for Razorpay
    let razorpayAmount;
    let razorpayCurrency;

    if (studentCurrency === "USD") {
        // Student pays in USD
        razorpayAmount = Math.round(studentPaidAmount * 100); // Convert to cents
        razorpayCurrency = "USD";
    } else {
        // Student pays in INR
        razorpayAmount = Math.round(studentPaidAmount * 100); // Convert to paise
        razorpayCurrency = "INR";
    }

    // Create unique order ID
    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    let razorpayOrder;
    try {
        // Create Razorpay order
        razorpayOrder = await razorpay.orders.create({
            amount: razorpayAmount,
            currency: razorpayCurrency,
            receipt: orderId,
            notes: {
                serviceType,
                period,
                duration,
                mentorId,
                studentId,
                orderId,
                studentCurrency,
                exchangeRateUsed: exchangeRateUsed || "",
            },
        });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        return res.status(500).json(
            new ApiResponse(500, null, "Error creating Razorpay order")
        );
    }

    // Calculate INR received (for your records)
    let amountReceivedInINR;
    if (studentCurrency === "USD") {
        amountReceivedInINR = studentPaidAmount * exchangeRateUsed;
    } else {
        amountReceivedInINR = studentPaidAmount;
    }

    // Save order to database with new fields
    const order = await Order.create({
        orderId,
        razorpayOrderId: razorpayOrder.id,
        studentId,
        mentorId,
        serviceType,
        period,
        duration,
        durationDetails: period === "One-time" ? "Single session" : duration,

        // New currency fields
        studentPaidAmount: studentPaidAmount,
        studentCurrency: studentCurrency,
        exchangeRateUsed: exchangeRateUsed || null,

        // Keep for backward compatibility
        amount: amountReceivedInINR,  // INR amount received
        currency: "INR",               // Always INR for settlement

        // Fee breakdown (always in INR)
        mentorFee: mentorFeeINR || Math.round(amountReceivedInINR * 0.8),
        partnerFee: partnerFeeINR || Math.round(amountReceivedInINR * 0.2),

        paymentStatus: "created",
        orderStatus: "pending",
        notes: {
            serviceType,
            period,
            duration,
            originalINRAmount: originalINRAmount || "",
        },
    });

    // Create transaction record
    await Transaction.create({
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: amountReceivedInINR,
        transactionCurrency: studentCurrency,
        transactionAmountInCurrency: studentPaidAmount,
        inrEquivalent: amountReceivedInINR,
        status: "initiated",
        transactionType: "payment",
        transactionCurrency: studentCurrency,
        transactionAmountInCurrency: studentPaidAmount,
        inrEquivalent: amountReceivedInINR,
    });

    // Initialize sessions for the order
    try {
        await initializeOrderSessions(
            order._id,
            order.period,
            order.mentorId,
            order.studentId
        );
    } catch (error) {
        console.error("Error initializing sessions:", error);
        // Don't fail the order creation if sessions fail
    }

    if (order) {
        try {
            const io = getIO();
            io.to(order.mentorId.toString()).emit('order:new', {
                orderId: order._id,
                mentorId: order.mentorId,
                studentName: req.user?.agencyName || req.user.firstName + ' ' + req.user.lastName,
                message: 'You have a new order!'
            });
        } catch (socketError) {
            console.error('Error emitting order event:', socketError);
            // Don't fail the request if socket emit fails
        }
    }

    return res.status(200).json(
        new ApiResponse(200, {
            order,
            razorpayOrderId: razorpayOrder.id,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID,
            amount: razorpayAmount,
            currency: razorpayCurrency,
        }, "Order created successfully")
    );
});

// 2. Verify Payment (called after successful payment)
// export const verifyPayment = asyncHandler(async (req, res) => {
//     const {
//         razorpay_order_id,
//         razorpay_payment_id,
//         razorpay_signature,
//     } = req.body;

//     // Verify signature
//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//         .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//         .update(body.toString())
//         .digest("hex");

//     const isAuthentic = expectedSignature === razorpay_signature;

//     if (!isAuthentic) {
//         return res.status(400).json(
//             new ApiResponse(400, null, "Invalid payment signature")
//         );
//     }

//     // Find order
//     const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
//     if (!order) {
//         return res.status(404).json(
//             new ApiResponse(404, null, "Order not found")
//         );
//     }

//     // Update order with payment details
//     order.razorpayPaymentId = razorpay_payment_id;
//     order.razorpaySignature = razorpay_signature;
//     order.paymentStatus = "paid";
//     order.orderStatus = "confirmed";
//     order.paymentCompletedAt = new Date();
//     await order.save();

//     // Update transaction
//     await Transaction.findOneAndUpdate(
//         { razorpayOrderId: razorpay_order_id },
//         {
//             razorpayPaymentId: razorpay_payment_id,
//             status: "success",
//         }
//     );

//     // Populate user details for response
//     await order.populate("studentId", "firstName lastName email");
//     await order.populate("mentorId", "firstName lastName email profileImage");

//     return res.status(200).json(
//         new ApiResponse(200, {
//             order,
//             paymentId: razorpay_payment_id,
//         }, "Payment verified successfully")
//     );
// });




// 2. Verify Payment (updated to handle both currencies)
export const verifyPayment = asyncHandler(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    } = req.body;

    // Verify signature (same as before)
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
        return res.status(400).json(
            new ApiResponse(400, null, "Invalid payment signature")
        );
    }

    // Find order
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
        return res.status(404).json(
            new ApiResponse(404, null, "Order not found")
        );
    }

    // Update order with payment details
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentCompletedAt = new Date();
    await order.save();

    // Update transaction
    await Transaction.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
            razorpayPaymentId: razorpay_payment_id,
            status: "success",
        }
    );

    // Populate user details
    await order.populate("studentId", "firstName lastName agencyName userType email");
    await order.populate("mentorId", "firstName lastName agencyName userType email profileImage");

    const student = await User.findById(order.studentId);
    const mentor = await User.findById(order.mentorId);

    const sessionDetails = {
        serviceType: order.serviceType,
        duration: order.durationDetails,
        mentorName: `${mentor.firstName} ${mentor.lastName}`,
    };

    orderConfirmationForStudent(transporter, student, order, sessionDetails)
        .catch(err => console.error('Student email failed:', err));
    orderConfirmationForMentor(transporter, mentor, order, student, sessionDetails)
        .catch(err => console.error('Mentor email failed:', err));

    return res.status(200).json(
        new ApiResponse(200, {
            order,
            paymentId: razorpay_payment_id,
        }, "Payment verified successfully")
    );
});

// 3. Webhook Handler (for async events)
export const handleWebhook = asyncHandler(async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    // Verify webhook signature
    const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(JSON.stringify(req.body))
        .digest("hex");

    if (signature !== expectedSignature) {
        return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const { event, payload } = req.body;

    switch (event) {
        case "payment.captured":
            // Payment successful
            const payment = payload.payment.entity;
            const order = await Order.findOne({ razorpayOrderId: payment.order_id });

            if (order && order.paymentStatus !== "paid") {
                order.paymentStatus = "paid";
                order.orderStatus = "confirmed";
                order.razorpayPaymentId = payment.id;
                order.paymentCompletedAt = new Date();
                await order.save();
            }
            break;

        case "payment.failed":
            // Payment failed
            const failedPayment = payload.payment.entity;
            const failedOrder = await Order.findOne({ razorpayOrderId: failedPayment.order_id });

            if (failedOrder) {
                failedOrder.paymentStatus = "failed";
                failedOrder.errorDetails = failedPayment.error_description || "Payment failed";
                failedOrder.paymentFailedAt = new Date();
                await failedOrder.save();
            }
            break;

        case "refund.created":
            // Handle refunds if needed
            console.log("Refund created:", payload.refund.entity);
            break;
    }

    return res.status(200).json({ received: true });
});

// 4. Get Order Status
export const getOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
        .populate("studentId", "firstName lastName agencyName email profileImage")
        .populate("mentorId", "firstName lastName agencyName email profileImage");

    if (!order) {
        return res.status(404).json(
            new ApiResponse(404, null, "Order not found")
        );
    }

    // Check if user is authorized (student or mentor or admin)
    if (
        order.studentId._id.toString() !== req.user.id &&
        order.mentorId._id.toString() !== req.user.id &&
        req.user.userType !== "admin"
    ) {
        return res.status(403).json(
            new ApiResponse(403, null, "Unauthorized")
        );
    }

    // Fetch session data for this order
    const sessions = await Session.find({ orderId: order._id })
        .sort({ sessionNumber: 1 });

    // Calculate session statistics
    const sessionStats = {
        total: sessions.length,
        pending: sessions.filter(s => s.status === "pending").length,
        submitted: sessions.filter(s => s.status === "submitted").length,
        approved: sessions.filter(s => s.status === "approved").length,
        rejected: sessions.filter(s => s.status === "rejected").length,
        allApproved: sessions.length > 0 && sessions.every(s => s.status === "approved"),
        progressPercentage: sessions.length > 0
            ? Math.round((sessions.filter(s => s.status === "approved").length / sessions.length) * 100)
            : 0,
    };

    // Get the next pending session number (for mentor to know which to submit next)
    const nextPendingSession = await Session.findOne({
        orderId: order._id,
        status: "pending",
    }).sort({ sessionNumber: 1 });

    // Get any rejected session that needs resubmission
    const rejectedSession = await Session.findOne({
        orderId: order._id,
        status: "rejected",
    }).sort({ sessionNumber: 1 });

    return res.status(200).json(
        new ApiResponse(200, {
            order,
            sessions,
            sessionStats,
            nextPendingSessionNumber: nextPendingSession ? nextPendingSession.sessionNumber : null,
            rejectedSession: rejectedSession ? {
                sessionNumber: rejectedSession.sessionNumber,
                id: rejectedSession._id,
                feedback: rejectedSession.studentFeedback,
                description: rejectedSession.description,
            } : null,
        }, "Order status fetched successfully")
    );
});

// 5. Get User Orders
// export const getUserOrders = asyncHandler(async (req, res) => {
//     const { userId } = req.params;
//     const { page = 1, limit = 10, status } = req.query;

//     const query = {
//         $or: [
//             { studentId: userId },
//             { mentorId: userId },
//         ],
//     };

//     if (status) {
//         query.paymentStatus = status;
//     }

//     const skip = (page - 1) * limit;

//     const orders = await Order.find(query)
//         .populate("studentId", "firstName lastName email profileImage")
//         .populate("mentorId", "firstName lastName email profileImage")
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(parseInt(limit));

//     const total = await Order.countDocuments(query);

//     return res.status(200).json(
//         new ApiResponse(200, {
//             orders,
//             pagination: {
//                 page: parseInt(page),
//                 limit: parseInt(limit),
//                 total,
//                 pages: Math.ceil(total / limit),
//             },
//         }, "Orders fetched successfully")
//     );
// });

export const getUserOrders = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const query = {
        $or: [
            { studentId: userId },
            { mentorId: userId },
        ],
    };

    if (status) {
        query.paymentStatus = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
        .populate("studentId", "firstName lastName agencyName email profileImage")
        .populate("mentorId", "firstName lastName agencyName email profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    // Get review information and session stats for each order
    const ordersWithData = await Promise.all(
        orders.map(async (order) => {
            const orderObj = order.toObject();

            // Get student's review (student reviewing mentor)
            const studentReview = await Review.findOne({
                order: order._id,
                reviewerRole: "student"
            }).populate("reviewer", "firstName lastName agencyName");

            // Get mentor's review (mentor reviewing student)
            const mentorReview = await Review.findOne({
                order: order._id,
                reviewerRole: "mentor"
            }).populate("reviewer", "firstName lastName agencyName");

            // Get session stats for this order
            const sessions = await Session.find({ orderId: order._id });

            const sessionStats = {
                total: sessions.length,
                pending: sessions.filter(s => s.status === "pending").length,
                submitted: sessions.filter(s => s.status === "submitted").length,
                approved: sessions.filter(s => s.status === "approved").length,
                rejected: sessions.filter(s => s.status === "rejected").length,
                allApproved: sessions.length > 0 && sessions.every(s => s.status === "approved"),
                progressPercentage: sessions.length > 0
                    ? Math.round((sessions.filter(s => s.status === "approved").length / sessions.length) * 100)
                    : 0,
            };

            return {
                ...orderObj,
                // Review data
                currentUserReviewed: !!(studentReview?.reviewer?.toString() === userId ||
                    mentorReview?.reviewer?.toString() === userId),
                studentReview: studentReview || null,
                mentorReview: mentorReview || null,
                studentReviewed: !!studentReview,
                mentorReviewed: !!mentorReview,
                // Session stats
                sessionStats,
            };
        })
    );

    const total = await Order.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            orders: ordersWithData,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        }, "Orders fetched successfully")
    );
});

// Mark order as delivered (mentor)
export const markOrderDelivered = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { deliveryNotes } = req.body;
    const attachments = req.files || [];
    console.log(orderId)

    const order = await NewOrder.findById(orderId);

    if (!order) {
        return res.status(404).json(new ApiResponse(404, null, "Order not found"));
    }

    if (order.mentorId.toString() !== req.user.id) {
        return res.status(403).json(new ApiResponse(403, null, "Not authorized"));
    }

    // Check if all sessions are approved
    const allApproved = await checkAllSessionsApproved(orderId);
    if (!allApproved) {
        throw new ApiError(400, "All sessions must be approved before making the final delivery.");
    }

    order.deliveryStatus = 'delivered';
    order.deliveryDetails = {
        notes: deliveryNotes,
        attachments: attachments.map(f => f.path),
        deliveredAt: new Date()
    };

    await order.save();

    const student = await User.findById(order.studentId).select("firstName lastName agencyName userType email");
    const mentor = await User.findById(order.mentorId).select("firstName lastName agencyName userType email");

    if (student && mentor) {
        orderDeliveredEmail(transporter, student, order, mentor, order.deliveryDetails)
            .catch(err => console.error(`Failed to send delivery email to student ${student.email}:`, err.message));
    }

    return res.status(200).json(new ApiResponse(200, order, "Order marked as delivered"));
});

// Complete order (student confirms)
export const completeOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await NewOrder.findById(orderId);

    if (!order) {
        return res.status(404).json(new ApiResponse(404, null, "Order not found"));
    }

    if (order.studentId.toString() !== req.user.id) {
        return res.status(403).json(new ApiResponse(403, null, "Not authorized"));
    }

    order.deliveryStatus = 'completed';
    order.orderStatus = 'completed';
    order.deliveryDetails.completedAt = new Date();

    await order.save();

    const student = await User.findById(order.studentId).select("firstName lastName agencyName email");
    const mentor = await User.findById(order.mentorId).select("firstName lastName agencyName email");

    if (student && mentor) {
        const completionDetails = {
            completedAt: order.deliveryDetails.completedAt
        };
        orderCompletedEmail(transporter, mentor, order, student, completionDetails)
            .catch(err => console.error(`Failed to send completion email to mentor ${mentor.email}:`, err.message));
    }

    return res.status(200).json(new ApiResponse(200, order, "Order completed successfully"));
});

// Get all orders for admin
export const getAllOrdersForAdmin = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, paymentStatus, orderStatus } = req.query;

    const query = {};
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (orderStatus) query.orderStatus = orderStatus;

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
        .populate("studentId", "firstName lastName agencyName email profileImage")
        .populate("mentorId", "firstName lastName agencyName email profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }, "All orders fetched successfully")
    );
});

// Get all transactions for admin
export const getAllTransactions = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 20,
        status,
        transactionType,
        startDate,
        endDate,
        search
    } = req.query;

    const query = {};

    // Filter by status
    if (status) {
        query.status = status;
    }

    // Filter by transaction type
    if (transactionType) {
        query.transactionType = transactionType;
    }

    // Date range filter
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search by orderId or paymentId
    if (search) {
        query.$or = [
            { razorpayOrderId: { $regex: search, $options: 'i' } },
            { razorpayPaymentId: { $regex: search, $options: 'i' } },
            { bankReference: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(query)
        .populate('orderId', 'orderId amount serviceType period studentId mentorId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    // Get summary stats
    const summary = await Transaction.aggregate([
        { $match: { status: 'success' } },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: '$amount' },
                totalCount: { $sum: 1 },
                avgAmount: { $avg: '$amount' }
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            transactions,
            summary: {
                totalAmount: summary[0]?.totalAmount || 0,
                totalCount: summary[0]?.totalCount || 0,
                avgAmount: summary[0]?.avgAmount || 0
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }, 'Transactions fetched successfully')
    );
});

// Get single transaction by ID
export const getTransactionById = asyncHandler(async (req, res) => {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId)
        .populate('orderId', 'orderId amount serviceType period duration studentId mentorId');

    if (!transaction) {
        return res.status(404).json(
            new ApiResponse(404, null, 'Transaction not found')
        );
    }

    return res.status(200).json(
        new ApiResponse(200, { transaction }, 'Transaction fetched successfully')
    );
});

// Get transaction summary for dashboard
export const getTransactionSummary = asyncHandler(async (req, res) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const summary = await Transaction.aggregate([
        {
            $facet: {
                daily: [
                    { $match: { createdAt: { $gte: startOfDay }, status: 'success' } },
                    { $group: { _id: null, amount: { $sum: '$amount' }, count: { $sum: 1 } } }
                ],
                weekly: [
                    { $match: { createdAt: { $gte: startOfWeek }, status: 'success' } },
                    { $group: { _id: null, amount: { $sum: '$amount' }, count: { $sum: 1 } } }
                ],
                monthly: [
                    { $match: { createdAt: { $gte: startOfMonth }, status: 'success' } },
                    { $group: { _id: null, amount: { $sum: '$amount' }, count: { $sum: 1 } } }
                ],
                yearly: [
                    { $match: { createdAt: { $gte: startOfYear }, status: 'success' } },
                    { $group: { _id: null, amount: { $sum: '$amount' }, count: { $sum: 1 } } }
                ],
                byStatus: [
                    { $group: { _id: '$status', amount: { $sum: '$amount' }, count: { $sum: 1 } } }
                ],
                byType: [
                    { $group: { _id: '$transactionType', amount: { $sum: '$amount' }, count: { $sum: 1 } } }
                ]
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            daily: summary[0]?.daily[0] || { amount: 0, count: 0 },
            weekly: summary[0]?.weekly[0] || { amount: 0, count: 0 },
            monthly: summary[0]?.monthly[0] || { amount: 0, count: 0 },
            yearly: summary[0]?.yearly[0] || { amount: 0, count: 0 },
            byStatus: summary[0]?.byStatus || [],
            byType: summary[0]?.byType || []
        }, 'Transaction summary fetched successfully')
    );
});

// Admin: Update order status (refund, cancel, etc.)
export const adminUpdateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { paymentStatus, orderStatus, refundAmount, adminNotes } = req.body;

    const order = await NewOrder.findById(orderId)
        .populate("studentId", "firstName lastName agencyName email")
        .populate("mentorId", "firstName lastName agencyName email");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Update payment status
    if (paymentStatus) {
        order.paymentStatus = paymentStatus;

        // If refunded, process refund logic
        if (paymentStatus === "refunded") {
            // Here you would integrate with Razorpay refund API
            // For now, we'll just mark it as refunded
            order.refundAmount = refundAmount || order.amount;
            order.refundedAt = new Date();

            // Create refund transaction record
            await Transaction.create({
                orderId: order._id,
                razorpayOrderId: order.razorpayOrderId,
                razorpayPaymentId: order.razorpayPaymentId,
                amount: refundAmount || order.amount,
                status: "refunded",
                transactionType: "refund",
                notes: adminNotes || "Refund processed by admin"
            });
        }
    }

    // Update order status
    if (orderStatus) {
        order.orderStatus = orderStatus;

        // If cancelled, also update payment status to refunded if paid
        if (orderStatus === "cancelled" && order.paymentStatus === "paid") {
            order.paymentStatus = "refunded";
        }
    }

    // Add admin notes
    if (adminNotes) {
        order.adminNotes = adminNotes;
    }

    await order.save();

    // Send email notification to both parties
    await sendOrderStatusUpdateEmail(order, { paymentStatus, orderStatus, adminNotes });

    return res.status(200).json(
        new ApiResponse(200, order, "Order status updated successfully")
    );
});

// Admin: Get single order details
export const adminGetOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await NewOrder.findById(orderId)
        .populate("studentId", "firstName lastName agencyName email profileImage phone")
        .populate("mentorId", "firstName lastName agencyName email profileImage phone");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Get resolution/complaint if exists
    const resolution = await Resolution.findOne({ orderId: order._id })
        .populate("userId", "firstName lastName agencyName email");

    // Get all transactions for this order
    const transactions = await Transaction.find({ orderId: order._id })
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, {
            order,
            resolution: resolution || null,
            transactions
        }, "Order details retrieved successfully")
    );
});

// Admin: Get order statistics
export const adminGetOrderStats = asyncHandler(async (req, res) => {
    const totalOrders = await NewOrder.countDocuments();
    const paidOrders = await NewOrder.countDocuments({ paymentStatus: "paid" });
    const pendingOrders = await NewOrder.countDocuments({ paymentStatus: { $in: ["pending", "created", "attempted"] } });
    const failedOrders = await NewOrder.countDocuments({ paymentStatus: "failed" });
    const refundedOrders = await NewOrder.countDocuments({ paymentStatus: "refunded" });

    const confirmedOrders = await NewOrder.countDocuments({ orderStatus: "confirmed" });
    const completedOrders = await NewOrder.countDocuments({ orderStatus: "completed" });
    const cancelledOrders = await NewOrder.countDocuments({ orderStatus: "cancelled" });

    // Revenue calculations
    const revenueAggregation = await NewOrder.aggregate([
        { $match: { paymentStatus: "paid" } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$amount" },
                totalMentorFees: { $sum: "$mentorFee" },
                totalPlatformFees: { $sum: "$partnerFee" }
            }
        }
    ]);

    const revenue = revenueAggregation[0] || { totalRevenue: 0, totalMentorFees: 0, totalPlatformFees: 0 };

    // Monthly revenue for charts
    const monthlyRevenue = await NewOrder.aggregate([
        {
            $match: {
                paymentStatus: "paid",
                paymentCompletedAt: { $exists: true }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$paymentCompletedAt" },
                    month: { $month: "$paymentCompletedAt" }
                },
                revenue: { $sum: "$amount" },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 12 }
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            counts: {
                total: totalOrders,
                paid: paidOrders,
                pending: pendingOrders,
                failed: failedOrders,
                refunded: refundedOrders,
                confirmed: confirmedOrders,
                completed: completedOrders,
                cancelled: cancelledOrders
            },
            revenue: {
                total: revenue.totalRevenue,
                mentorFees: revenue.totalMentorFees,
                platformFees: revenue.totalPlatformFees
            },
            monthlyRevenue
        }, "Order statistics retrieved")
    );
});

// Helper function to send email
// const sendOrderStatusUpdateEmail = async (order, updates) => {
//   // Get user emails
//   const student = order.studentId;
//   const mentor = order.mentorId;

//   let statusMessage = "";
//   if (updates.paymentStatus === "refunded") {
//     statusMessage = "Your payment has been refunded.";
//   } else if (updates.orderStatus === "cancelled") {
//     statusMessage = "This order has been cancelled.";
//   } else if (updates.orderStatus === "completed") {
//     statusMessage = "This order has been marked as completed.";
//   }

//   const emailHtml = `
//     <h2>Order Status Update - ${order.orderId}</h2>
//     <p>Dear ${student.firstName} ${student.lastName},</p>
//     <p>${statusMessage}</p>
//     ${updates.adminNotes ? `<p><strong>Admin Notes:</strong> ${updates.adminNotes}</p>` : ""}
//     <hr />
//     <p><strong>Order Details:</strong></p>
//     <p>Service: ${order.serviceType}</p>
//     <p>Amount: ₹${order.amount}</p>
//     <p>Order Status: ${updates.orderStatus || order.orderStatus}</p>
//     <p>Payment Status: ${updates.paymentStatus || order.paymentStatus}</p>
//     <hr />
//     <p>If you have any questions, please contact support.</p>
//   `;

//   // Send email to student
//   await sendEmail({
//     to: student.email,
//     subject: `Order Status Update - ${order.orderId}`,
//     html: emailHtml
//   });

//   // Send email to mentor
//   await sendEmail({
//     to: mentor.email,
//     subject: `Order Status Update - ${order.orderId}`,
//     html: emailHtml
//   });
// };

// Get order history between two users (mentor and student)
export const getOrderHistoryBetweenUsers = asyncHandler(async (req, res) => {
    const { userId1, userId2 } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Verify that the requesting user is one of the two users (or admin)
    if (
        req.user.userType !== "admin" &&
        req.user._id.toString() !== userId1 &&
        req.user._id.toString() !== userId2
    ) {
        throw new ApiError(403, "Unauthorized to view this order history");
    }

    const query = {
        $or: [
            { studentId: userId1, mentorId: userId2 },
            { studentId: userId2, mentorId: userId1 }
        ]
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
        .populate("studentId", "firstName lastName agencyName email profileImage")
        .populate("mentorId", "firstName lastName agencyName email profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    return res.status(200).json(
        new ApiResponse(200, {
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        }, "Order history fetched successfully")
    );
});
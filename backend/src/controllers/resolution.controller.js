import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Resolution from "../models/resolution.model.js";
import Transaction from "../models/transaction.model.js";
// import Order from "../models/newOrder.model.js";
import NewOrder from "../models/newOrder.model.js";
import { complaintNotificationForAdmin, complaintNotificationForMentor, resolutionStatusUpdateEmail } from "../utils/emailTemplates.js";
import transporter from "../utils/nodemailer.js";
import { uploadFile } from "../utils/cloudinary.js";
// import { sendEmail } from "../utils/email.js";
import path from 'path';

// In resolution.controller.js - update submitComplaint function
export const submitComplaint = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { issueType, complaint } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!issueType || !complaint) {
        throw new ApiError(400, "Issue type and complaint are required");
    }

    if (complaint.length < 10 || complaint.length > 500) {
        throw new ApiError(400, "Complaint must be between 10 and 500 characters");
    }

    // Find the order
    const order = await NewOrder.findById(orderId)
        .populate("studentId", "firstName lastName email")
        .populate("mentorId", "firstName lastName email");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Check if user owns this order
    if (order.studentId._id.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only submit complaints for your own orders");
    }

    // Check if complaint already exists
    const existingComplaint = await Resolution.findOne({
        orderId,
        userId,
        status: { $in: ["pending", "in_review"] }
    });

    if (existingComplaint) {
        throw new ApiError(400, "You already have an active complaint for this order");
    }

    // Process attachments if any
    let attachments = [];
    if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(async (file) => {
            const result = await uploadFile(file.buffer, file.originalname);
            const fileExtension = path.extname(file.originalname).toLowerCase();
            let fileType = 'document';
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExtension)) {
                fileType = 'image';
            } else if (fileExtension === '.pdf') {
                fileType = 'pdf';
            }
            return {
                url: result.secure_url,
                publicId: result.public_id,
                fileName: file.originalname,
                fileType: fileType,
                uploadedAt: new Date(),
            };
        });
        attachments = await Promise.all(uploadPromises);
    }

    // Map issue type to display text
    const issueTypeMap = {
        session_not_happened: "Session did not happen — mentor was unavailable",
        mentor_not_responding: "Mentor not responding — no reply for 48+ hours",
        service_not_as_described: "Service not as described — does not match the plan",
        request_refund: "Request a refund",
    };

    // Create resolution complaint
    const resolution = await Resolution.create({
        orderId: order._id,
        orderNumber: order.orderId,
        userId: userId,
        mentorId: order.mentorId._id,
        issueType: issueType,
        issueTypeDisplay: issueTypeMap[issueType],
        complaint: complaint,
        attachments: attachments,
        status: "pending",
    });

    // Send emails
    complaintNotificationForAdmin(transporter, resolution, order, order.studentId, order.mentorId)
        .catch(err => console.error('Admin complaint email failed:', err.message));

    complaintNotificationForMentor(transporter, order.mentorId, order, order.studentId, resolution)
        .catch(err => console.error('Mentor complaint email failed:', err.message));

    return res
        .status(201)
        .json(new ApiResponse(201, resolution, "Complaint submitted successfully"));
});

// Get resolution status for an order
export const getResolutionStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user._id;

    const resolution = await Resolution.findOne({
        orderId,
        userId
    }).sort({ createdAt: -1 });

    if (!resolution) {
        return res
            .status(200)
            .json(new ApiResponse(200, null, "No resolution found for this order"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, resolution, "Resolution status retrieved"));
});

// Admin: Get all resolutions
export const getAllResolutions = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const resolutions = await Resolution.find(filter)
        .populate("userId", "firstName lastName email profileImage")
        .populate("mentorId", "firstName lastName email profileImage")
        .populate("orderId", "orderId amount period duration")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await Resolution.countDocuments(filter);

    return res
        .status(200)
        .json(new ApiResponse(200, { resolutions, total, page, limit }, "Resolutions retrieved"));
});

// Updated updateResolutionStatus function with order status sync
export const updateResolutionStatus = asyncHandler(async (req, res) => {
    const { resolutionId } = req.params;
    const {
        status,
        adminNotes,
        resolution,
        refundAmount,
        updateOrderStatus,  // boolean flag
        orderStatusUpdate,  // { paymentStatus, orderStatus }
        sendEmailNotification = true
    } = req.body;

    const resolutionDoc = await Resolution.findById(resolutionId)
        .populate("userId", "firstName lastName email")
        .populate("mentorId", "firstName lastName email")
        .populate("orderId");

    if (!resolutionDoc) {
        throw new ApiError(404, "Resolution not found");
    }

    // Update resolution fields
    resolutionDoc.status = status || resolutionDoc.status;
    resolutionDoc.adminNotes = adminNotes || resolutionDoc.adminNotes;
    resolutionDoc.resolution = resolution || resolutionDoc.resolution;

    if (refundAmount) {
        resolutionDoc.refundAmount = refundAmount;
    }

    if (status === "resolved") {
        resolutionDoc.resolvedAt = new Date();
    }

    const order = await NewOrder.findById(resolutionDoc.orderId._id);

    // Update order status if requested
    if (updateOrderStatus && orderStatusUpdate) {

        if (order) {
            // Update payment status
            if (orderStatusUpdate.paymentStatus) {
                order.paymentStatus = orderStatusUpdate.paymentStatus;

                // If refunded, add refund details
                if (orderStatusUpdate.paymentStatus === "refunded") {
                    order.refundAmount = refundAmount || order.amount;
                    order.refundedAt = new Date();
                    order.refundReason = resolution;

                    // Create refund transaction record
                    await Transaction.create({
                        orderId: order._id,
                        razorpayOrderId: order.razorpayOrderId,
                        razorpayPaymentId: order.razorpayPaymentId,
                        amount: refundAmount || order.amount,
                        status: "refunded",
                        transactionType: "refund",
                        notes: adminNotes || `Refund processed for complaint: ${resolutionDoc._id}`
                    });
                }
            }

            // Update order status
            if (orderStatusUpdate.orderStatus) {
                order.orderStatus = orderStatusUpdate.orderStatus;
            }

            await order.save();
        }
    }

    await resolutionDoc.save();

    // Prepare update details object
    const updateDetails = {
        newStatus: resolutionDoc.status,
        adminNotes: resolutionDoc.adminNotes,
        resolutionText: resolutionDoc.resolution,
        refundAmount: resolutionDoc.refundAmount || null,
        orderPaymentStatus: null,
        orderStatus: null,
        isRefunded: false
    };

    // If order status was updated
    if (updateOrderStatus && orderStatusUpdate) {
        updateDetails.orderPaymentStatus = orderStatusUpdate.paymentStatus || null;
        updateDetails.orderStatus = orderStatusUpdate.orderStatus || null;
        if (orderStatusUpdate.paymentStatus === 'refunded') {
            updateDetails.isRefunded = true;
        }
    }

    // Send email to student (userId)
    if (resolutionDoc.userId) {
        resolutionStatusUpdateEmail(transporter, resolutionDoc.userId, resolutionDoc, order, updateDetails)
            .catch(err => console.error(`Resolution email to student failed: ${err.message}`));
    }

    // Send email to mentor (mentorId)
    if (resolutionDoc.mentorId) {
        resolutionStatusUpdateEmail(transporter, resolutionDoc.mentorId, resolutionDoc, order, updateDetails)
            .catch(err => console.error(`Resolution email to mentor failed: ${err.message}`));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, resolutionDoc, "Resolution status updated successfully"));
});

// Helper: Send email to admin
const sendResolutionEmailToAdmin = async (resolution, order, user) => {
    const issueTypeMap = {
        session_not_happened: "Session did not happen — mentor was unavailable",
        mentor_not_responding: "Mentor not responding — no reply for 48+ hours",
        service_not_as_described: "Service not as described — does not match the plan",
        request_refund: "Request a refund",
    };

    const emailHtml = `
    <h2>New Resolution Complaint</h2>
    <p><strong>Order Number:</strong> ${order.orderId}</p>
    <p><strong>Booking Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
    <p><strong>Student:</strong> ${user.firstName} ${user.lastName} (${user.email})</p>
    <p><strong>Mentor:</strong> ${order.mentorId.firstName} ${order.mentorId.lastName}</p>
    <p><strong>Issue Type:</strong> ${issueTypeMap[resolution.issueType]}</p>
    <p><strong>Complaint:</strong></p>
    <p>${resolution.complaint}</p>
    <p><strong>Status:</strong> Pending Review</p>
    <hr />
    <p>Please login to the admin dashboard to review and respond to this complaint.</p>
    <a href="${process.env.ADMIN_URL}/resolution/${resolution._id}">View Complaint</a>
  `;

    // await sendEmail({
    //     to: process.env.ADMIN_EMAIL,
    //     subject: `New Resolution Complaint - Order #${order.orderId}`,
    //     html: emailHtml,
    // });
};

// Helper: Send email to user about resolution update
const sendResolutionUpdateEmail = async (resolution) => {
    const statusMessages = {
        in_review: "Your complaint is currently under review by our team.",
        resolved: "Your complaint has been resolved. Please check the resolution details below.",
        rejected: "Your complaint has been reviewed and rejected. Contact support for more details.",
        refunded: "Your refund has been processed. The amount will reflect in your account within 3-5 business days.",
    };

    const emailHtml = `
    <h2>Resolution Update - Order #${resolution.orderNumber}</h2>
    <p><strong>Status:</strong> ${resolution.status.toUpperCase()}</p>
    <p>${statusMessages[resolution.status]}</p>
    ${resolution.resolution ? `<p><strong>Resolution:</strong> ${resolution.resolution}</p>` : ""}
    ${resolution.refundAmount ? `<p><strong>Refund Amount:</strong> $${resolution.refundAmount}</p>` : ""}
    ${resolution.adminNotes ? `<p><strong>Admin Notes:</strong> ${resolution.adminNotes}</p>` : ""}
    <hr />
    <p>If you have any questions, please contact support at ${process.env.SUPPORT_EMAIL}</p>
  `;

    // await sendEmail({
    //     to: resolution.userId.email,
    //     subject: `Resolution Update - Order #${resolution.orderNumber}`,
    //     html: emailHtml,
    // });
};

// Admin: Get resolution statistics
export const adminGetResolutionStats = asyncHandler(async (req, res) => {
    const stats = await Resolution.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    const result = {
        total: 0,
        pending: 0,
        in_review: 0,
        resolved: 0,
        rejected: 0,
        refunded: 0
    };

    stats.forEach(stat => {
        result[stat._id] = stat.count;
        result.total += stat.count;
    });

    return res.status(200).json(
        new ApiResponse(200, result, "Resolution stats retrieved")
    );
});
import Transaction from "../models/transaction.model.js";
import NewOrder from "../models/newOrder.model.js";
import { ApiError } from "../utils/ApiError.js";
import Resolution from "../models/resolution.model.js";

export const validateRefundableOrder = async (req, res, next) => {
    const { resolutionId } = req.params;
    const { refundAmount, updateOrderStatus, orderStatusUpdate } = req.body;

    // Only validate if we're processing a refund
    if (!updateOrderStatus || orderStatusUpdate?.paymentStatus !== "refunded") {
        return next();
    }

    try {
        const resolution = await Resolution.findById(resolutionId).populate("orderId");

        if (!resolution) {
            throw new ApiError(404, "Resolution not found");
        }

        const order = resolution.orderId;

        // Check if order is already refunded
        if (order.paymentStatus === "refunded") {
            throw new ApiError(400, "Order is already refunded");
        }

        // Check if payment was successfully captured
        if (order.paymentStatus !== "paid") {
            throw new ApiError(400, "Cannot refund order that hasn't been paid");
        }

        // Check if refund amount is valid
        if (refundAmount && (refundAmount <= 0 || refundAmount > order.amount)) {
            throw new ApiError(400, "Invalid refund amount");
        }

        // Check for existing refund transaction
        const existingRefund = await Transaction.findOne({
            orderId: order._id,
            transactionType: "refund",
            status: { $in: ["refunded", "processing"] }
        });

        if (existingRefund) {
            throw new ApiError(400, "Refund already processed for this order");
        }

        next();
    } catch (error) {
        next(error);
    }
};
import { model, Schema } from "mongoose";

const transactionSchema = new Schema(
    {
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "NewOrder",
            required: true,
        },
        razorpayPaymentId: {
            type: String,
        },
        razorpayOrderId: {
            type: String,
        },
        transactionType: {
            type: String,
            enum: ["payment", "refund", "capture"],
            default: "payment",
        },
        amount: {
            type: Number,
            required: true,
        },
        // Add these to your transactionSchema:
        transactionCurrency: { 
            type: String,
            enum: ["USD", "INR"],
            default: "INR",
        },
        transactionAmountInCurrency: {
            type: Number,
            comment: "Amount in the currency student paid",
        },
        inrEquivalent: {
            type: Number,
            comment: "INR equivalent at time of transaction",
        },
        status: {
            type: String,
            enum: ["initiated", "success", "failed", "pending", "refunded", "processing"],
            default: "pending",
        },
        paymentMethod: {
            type: String,
        },
        bankReference: {
            type: String,
        },
        errorMessage: {
            type: String,
        },
        rawResponse: {
            type: Schema.Types.Mixed,
        },
    },
    { timestamps: true }
);

transactionSchema.index({ orderId: 1 });
transactionSchema.index({ razorpayPaymentId: 1 });
transactionSchema.index({ createdAt: -1 });

const Transaction = model("Transaction", transactionSchema);
export default Transaction;
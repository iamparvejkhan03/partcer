import { model, Schema } from "mongoose";

const withdrawalSchema = new Schema({
    withdrawalId: {
        type: String,
        unique: true,
        required: true,
    },
    freelancerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 10,
    },
    method: {
        type: String,
        enum: ["paypal", "bank_transfer", "credit_card", "mobile_money", "upi"],
        required: true,
    },
    methodDetails: {
        type: String,
    },
    status: {
        type: String,
        enum: ["pending", "clearing", "completed", "cancelled"],
        default: "pending",
    },
    notes: {
        type: String,
    },
    transactionId: {
        type: String,
    },
    processedDate: {
        type: Date,
    },
    processedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    cancellationReason: {
        type: String,
    },
}, { timestamps: true });

withdrawalSchema.index({ freelancerId: 1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ createdAt: -1 });

const Withdrawal = model("Withdrawal", withdrawalSchema);
export default Withdrawal;
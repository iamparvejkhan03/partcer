import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
    {
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "NewOrder",
            required: true,
        },
        sessionNumber: {
            type: Number,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "submitted", "approved", "rejected"],
            default: "pending",
        },
        submittedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        submittedAt: {
            type: Date,
        },
        studentFeedback: {
            type: String,
            trim: true,
        },
        rejectedAt: {
            type: Date,
        },
        approvedAt: {
            type: Date,
        },
        mentorId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        studentId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

// Indexes for faster queries
sessionSchema.index({ orderId: 1, sessionNumber: 1 });
sessionSchema.index({ orderId: 1, status: 1 });
sessionSchema.index({ mentorId: 1 });
sessionSchema.index({ studentId: 1 });

const Session = mongoose.model("Session", sessionSchema);
export default Session;
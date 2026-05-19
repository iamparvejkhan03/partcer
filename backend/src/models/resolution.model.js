import mongoose from "mongoose";

const resolutionSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewOrder",
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issueType: {
      type: String,
      enum: [
        "session_not_happened",
        "mentor_not_responding",
        "service_not_as_described",
        "request_refund",
      ],
      required: true,
    },
    issueTypeDisplay: {
      type: String,
      required: true,
    },
    complaint: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "in_review", "resolved", "rejected", "refunded"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    resolution: {
      type: String,
      default: "",
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    resolvedAt: {
      type: Date,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index for faster queries
resolutionSchema.index({ orderId: 1, userId: 1 });
resolutionSchema.index({ status: 1 });
resolutionSchema.index({ orderNumber: 1 });

const Resolution = mongoose.model("Resolution", resolutionSchema);
export default Resolution;
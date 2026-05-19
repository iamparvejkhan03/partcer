import { model, Schema } from "mongoose";

const newOrderSchema = new Schema(
  {
    // Order identification
    orderId: {
      type: String,
      unique: true,
      required: true,
    },
    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
    },
    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    razorpaySignature: {
      type: String,
    },

    // User information
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Booking details
    serviceType: {
      type: String,
      enum: ["Job Support (Mentoring)", "Skill Training", "Mock Interview Support"],
      required: true,
    },
    period: {
      type: String,
      enum: ["One-time", "Per day", "Weekly", "Monthly"],
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    durationDetails: {
      type: String,
    },

    // Payment details
    amount: {
      type: Number, // Amount in INR (paise for Razorpay, but we'll store in rupees)
      required: true,
    },
    mentorFee: {
      type: Number,
      required: true,
    },
    partnerFee: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },

    // What student actually paid (in their currency)
    studentPaidAmount: {
      type: Number,
      required: true,
    },

    // Which currency they paid in (USD or INR)
    studentCurrency: {
      type: String,
      enum: ["USD", "INR"],
      required: true,
      default: "INR",
    },

    // Exchange rate used at payment time (only if studentCurrency is USD)
    exchangeRateUsed: {
      type: Number,
      required: function () {
        return this.studentCurrency === "USD";
      },
      // Example: 84.00 means 1 USD = 84 INR
    },

    // Payment status
    paymentStatus: {
      type: String,
      enum: ["pending", "created", "attempted", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "refunded"],
      default: "pending",
    },

    // Timestamps
    paymentAttemptedAt: Date,
    paymentCompletedAt: Date,
    paymentFailedAt: Date,

    // delivery details
    deliveryStatus: {
      type: String,
      enum: ['pending', 'delivered', 'completed'],
      default: 'pending'
    },
    deliveryDetails: {
      notes: String,
      attachments: [String],
      deliveredAt: Date,
      completedAt: Date
    },

    studentReviewed: {
      type: Boolean,
      default: false
    },
    mentorReviewed: {
      type: Boolean,
      default: false
    },

    // Metadata
    notes: {
      type: Map,
      of: String,
    },
    errorDetails: {
      type: String,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
newOrderSchema.index({ studentId: 1 });
newOrderSchema.index({ mentorId: 1 });
// newOrderSchema.index({ razorpayOrderId: 1 });
newOrderSchema.index({ paymentStatus: 1 });
newOrderSchema.index({ createdAt: -1 });

const NewOrder = model("NewOrder", newOrderSchema);
export default NewOrder;
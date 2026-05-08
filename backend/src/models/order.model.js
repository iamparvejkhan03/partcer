import mongoose, { Schema } from "mongoose";

// Order timeline event schema
const timelineEventSchema = new Schema({
  status: {
    type: String,
    enum: [
      "pending",
      "active",
      "delivered",
      "completed",
      "cancelled",
      "disputed",
      "refunded",
    ],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  note: String,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
  },
});

// Message/chat reference schema
const messageSchema = new Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: String,
  attachments: [
    {
      name: String,
      url: String,
      publicId: String,
      type: String,
      size: Number,
    },
  ],
  isSystem: {
    type: Boolean,
    default: false,
  },
  readBy: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      readAt: Date,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Delivery/screenshot attachment schema
const deliveryAttachmentSchema = new Schema({
  name: String,
  url: String,
  publicId: String,
  type: String,
  size: Number,
  isFinal: {
    type: Boolean,
    default: false,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Delivery schema
const deliverySchema = new Schema({
  message: String,
  attachments: [deliveryAttachmentSchema],
  isRevision: {
    type: Boolean,
    default: false,
  },
  revisionNumber: Number,
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["pending_review", "approved", "rejected", "revision_requested"],
    default: "pending_review",
  },
  feedback: String,
  reviewedAt: Date,
});

// Revision request schema
const revisionRequestSchema = new Schema({
  message: String,
  attachments: [deliveryAttachmentSchema],
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
});

// Dispute schema
const disputeSchema = new Schema({
  openedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reason: {
    type: String,
    required: true,
  },
  description: String,
  attachments: [deliveryAttachmentSchema],
  status: {
    type: String,
    enum: ["open", "under_review", "resolved", "closed"],
    default: "open",
  },
  resolution: {
    type: {
      type: String,
      enum: ["refund_buyer", "release_seller", "partial_refund", "cancelled"],
    },
    message: String,
    refundAmount: Number,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: Date,
  },
  messages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      message: String,
      attachments: [deliveryAttachmentSchema],
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  openedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

// Refund schema
const refundSchema = new Schema({
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  reason: String,
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
  method: {
    type: String,
    enum: ["original", "wallet", "bank_transfer", "paypal"],
    default: "original",
  },
  transactionId: String,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  processedAt: Date,
  notes: String,
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Main Order Schema
const orderSchema = new Schema(
  {
    // ==================== BASIC ORDER INFORMATION ====================
    orderId: {
      type: String,
      unique: true,
      trim: true,
    },
    orderType: {
      type: String,
      enum: ["service", "custom_offer", "project"],
      required: true,
    },

    // ==================== ORDER STATUS ====================
    status: {
      type: String,
      enum: [
        "pending", // Initial state, waiting for payment or confirmation
        "active", // Order in progress
        "delivered", // Freelancer has delivered
        "completed", // Buyer accepted delivery
        "cancelled", // Order cancelled
        "disputed", // Dispute opened
        "refunded", // Refund processed
        "expired", // Order expired
        "suspended", // Order suspended by admin
      ],
      default: "pending",
    },

    // ==================== PARTICIPANTS ====================
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==================== SERVICE/PROJECT REFERENCE ====================
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    customOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomOffer",
    },

    // ==================== ORDER Requirements ====================

    requirements: {
      text: {
        type: String,
        trim: true,
      },
      attachments: [
        new Schema({
          name: { type: String, required: true },
          url: { type: String, required: true },
          publicId: { type: String, required: true },
          type: { type: String, required: true },
          size: { type: Number, required: true },
          uploadedAt: { type: Date, default: Date.now },
        }),
      ],
      submittedAt: {
        type: Date,
      },
      updatedAt: {
        type: Date,
      },
      status: {
        type: String,
        enum: ["pending", "submitted", "approved"],
        default: "pending",
      },
    },

    // ==================== ORDER DETAILS (Snapshot) ====================
    details: {
      title: {
        type: String,
        required: true,
      },
      description: String,
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
      subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
      skills: [String],
      package: {
        name: String,
        description: String,
        features: [String],
      },
      requirements: String,
    },

    // ==================== PRICING ====================
    pricing: {
      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },
      platformFee: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
      platformFeePercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 10, // 10% platform fee
      },
      processingFee: {
        type: Number,
        min: 0,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
        min: 0,
      },
      sellerEarnings: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },

    // ==================== TIMELINE ====================
    timeline: {
      orderedAt: {
        type: Date,
        default: Date.now,
      },
      deadline: Date,
      startedAt: Date,
      deliveredAt: Date,
      completedAt: Date,
      cancelledAt: Date,
      disputedAt: Date,
    },

    // ==================== PAYMENT ====================
    payment: {
      status: {
        type: String,
        enum: ["pending", "processing", "paid", "held", "refunded", "failed"],
        default: "pending",
      },
      method: {
        type: String,
        enum: ["credit_card", "paypal", "bank_transfer", "wallet"],
      },
      transactionId: String,
      paymentIntentId: String,
      paidAt: Date,
      paymentDetails: {
        type: Map,
        of: Schema.Types.Mixed,
      },
    },

    // ==================== DELIVERY & REVISIONS ====================
    delivery: {
      current: deliverySchema,
      history: [deliverySchema],
      revisions: {
        allowed: {
          type: Number,
          default: 2,
        },
        used: {
          type: Number,
          default: 0,
        },
        requests: [revisionRequestSchema],
      },
    },

    // ==================== DISPUTE & REFUND ====================
    dispute: disputeSchema,
    refund: refundSchema,

    // ==================== REVIEW & RATING ====================
    // review: {
    //   rating: {
    //     type: Number,
    //     min: 1,
    //     max: 5,
    //   },
    //   comment: String,
    //   privateFeedback: String,
    //   submittedBy: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //   },
    //   submittedAt: Date,
    // },

    // sellerReview: {
    //   rating: {
    //     type: Number,
    //     min: 1,
    //     max: 5,
    //   },
    //   comment: String,
    //   submittedAt: Date,
    // },

    // ==================== TIMELINE EVENTS ====================
    timelineEvents: [timelineEventSchema],

    // ==================== MESSAGES ====================
    recentMessages: [messageSchema],

    // ==================== STATISTICS ====================
    stats: {
      isUrgent: {
        type: Boolean,
        default: false,
      },
      responseTime: Number, // in hours
      completionTime: Number, // in hours
      revisionsCount: {
        type: Number,
        default: 0,
      },
    },

    // ==================== METADATA ====================
    metadata: {
      ip: String,
      userAgent: String,
      source: {
        type: String,
        enum: ["web", "mobile", "api"],
        default: "web",
      },
    },

    // ==================== BILLING INFO ====================
    billingInfo: {
      fullName: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
      phone: {
        type: String,
        required: false,
      },
      address: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: false,
      },
      country: {
        type: String,
        required: false,
      },
      postalCode: {
        type: String,
        required: false,
      },
    },

    // ==================== ADMIN FIELDS ====================
    adminNotes: [
      {
        note: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    flags: [
      {
        type: {
          type: String,
          enum: ["suspicious", "high_risk", "violation"],
        },
        reason: String,
        flaggedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        flaggedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ==================== INDEXES ====================
// orderSchema.index({ orderId: 1 });
orderSchema.index({ buyer: 1, status: 1 });
orderSchema.index({ seller: 1, status: 1 });
orderSchema.index({ status: 1, "timeline.deadline": 1 });
orderSchema.index({ "payment.status": 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ "dispute.status": 1 });
orderSchema.index({ orderType: 1 });

// ==================== MIDDLEWARE ====================

// Generate order ID before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    const prefix = "ORD";
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    // Generate random 4-digit number
    const random = Math.floor(1000 + Math.random() * 9000);

    this.orderId = `${prefix}-${year}${month}${day}-${random}`;
  }

  // Add timeline event when status changes
  if (this.isModified("status")) {
    const event = {
      status: this.status,
      date: new Date(),
    };

    // Update timeline dates based on status
    switch (this.status) {
      case "active":
        this.timeline.startedAt = new Date();
        break;
      case "delivered":
        this.timeline.deliveredAt = new Date();
        break;
      case "completed":
        this.timeline.completedAt = new Date();
        // Calculate completion time
        if (this.timeline.startedAt) {
          this.stats.completionTime = Math.round(
            (new Date() - this.timeline.startedAt) / (1000 * 60 * 60),
          );
        }
        break;
      case "cancelled":
        this.timeline.cancelledAt = new Date();
        break;
      case "disputed":
        this.timeline.disputedAt = new Date();
        break;
    }

    this.timelineEvents.push(event);
  }

  next();
});

// ==================== VIRTUAL PROPERTIES ====================

// Time remaining
orderSchema.virtual("timeRemaining").get(function () {
  if (!this.timeline.deadline || this.status !== "active") return null;

  const now = new Date();
  const deadline = new Date(this.timeline.deadline);
  const diff = deadline - now;

  if (diff < 0) return "Overdue";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h remaining`;
  return "Due soon";
});

// Can request revision
orderSchema.virtual("canRequestRevision").get(function () {
  return (
    this.status === "delivered" &&
    this.delivery.revisions.used < this.delivery.revisions.allowed
  );
});

// Revisions left
orderSchema.virtual("revisionsLeft").get(function () {
  return this.delivery.revisions.allowed - this.delivery.revisions.used;
});

// ==================== INSTANCE METHODS ====================

// Start order
orderSchema.methods.start = function () {
  if (this.status !== "pending" || this.payment.status !== "paid") {
    throw new Error("Order cannot be started");
  }

  this.status = "active";
  this.timeline.startedAt = new Date();

  return this.save();
};

// Deliver order
orderSchema.methods.deliver = function (deliveryData) {
  if (this.status !== "active") {
    throw new Error("Order must be active to deliver");
  }

  // Save current delivery to history
  if (this.delivery.current) {
    this.delivery.history.push(this.delivery.current);
  }

  // Set new delivery
  this.delivery.current = {
    ...deliveryData,
    submittedAt: new Date(),
    status: "pending_review",
  };

  this.status = "delivered";
  this.timeline.deliveredAt = new Date();

  return this.save();
};

// Request revision
orderSchema.methods.requestRevision = function (revisionData) {
  if (!this.canRequestRevision) {
    throw new Error("Cannot request more revisions");
  }

  this.delivery.revisions.used += 1;
  this.delivery.revisions.requests.push({
    ...revisionData,
    requestedAt: new Date(),
  });

  this.delivery.current.status = "revision_requested";
  this.status = "active";

  return this.save();
};

// Approve delivery
orderSchema.methods.approveDelivery = function () {
  if (this.status !== "delivered") {
    throw new Error("Order must be in delivered state");
  }

  this.delivery.current.status = "approved";
  this.status = "completed";
  this.timeline.completedAt = new Date();

  return this.save();
};

// Complete order
orderSchema.methods.complete = function (rating, review) {
  this.status = "completed";
  this.timeline.completedAt = new Date();
  this.review = {
    rating,
    comment: review,
    submittedAt: new Date(),
  };

  return this.save();
};

// Cancel order
orderSchema.methods.cancel = function (reason, cancelledBy) {
  if (!["pending", "active"].includes(this.status)) {
    throw new Error("Order cannot be cancelled in current state");
  }

  this.status = "cancelled";
  this.timeline.cancelledAt = new Date();

  // If payment was made, process refund
  if (this.payment.status === "paid") {
    this.refund = {
      amount: this.pricing.total,
      reason: reason,
      status: "pending",
    };
    this.payment.status = "held";
  }

  return this.save();
};

// Open dispute
orderSchema.methods.openDispute = function (disputeData) {
  if (!["active", "delivered"].includes(this.status)) {
    throw new Error("Cannot open dispute for this order");
  }

  this.dispute = {
    ...disputeData,
    openedBy: disputeData.userId,
    openedAt: new Date(),
    status: "open",
  };

  this.status = "disputed";
  this.payment.status = "held";

  return this.save();
};

// Resolve dispute
orderSchema.methods.resolveDispute = function (resolution, resolvedBy) {
  if (this.status !== "disputed") {
    throw new Error("Order is not in dispute");
  }

  this.dispute.status = "resolved";
  this.dispute.resolution = {
    ...resolution,
    resolvedBy,
    resolvedAt: new Date(),
  };

  // Update order based on resolution
  switch (resolution.type) {
    case "refund_buyer":
      this.status = "cancelled";
      this.payment.status = "refunded";
      break;
    case "release_seller":
      this.status = this.delivery.current ? "delivered" : "active";
      this.payment.status = "paid";
      break;
    case "partial_refund":
      this.refund = {
        amount: resolution.refundAmount,
        status: "pending",
      };
      break;
  }

  return this.save();
};

// Process refund
orderSchema.methods.processRefund = function (refundData) {
  this.refund = {
    ...refundData,
    status: "processing",
  };
  this.payment.status = "refunded";
  this.status = "refunded";

  return this.save();
};

// Add message
orderSchema.methods.addMessage = function (messageData) {
  this.recentMessages.push(messageData);

  // Keep only last 50 messages
  if (this.recentMessages.length > 50) {
    this.recentMessages = this.recentMessages.slice(-50);
  }

  return this.save();
};

// Add admin note
orderSchema.methods.addAdminNote = function (note, adminId) {
  this.adminNotes.push({
    note,
    addedBy: adminId,
    addedAt: new Date(),
  });

  return this.save();
};

// Flag order
orderSchema.methods.flag = function (flagData) {
  this.flags.push({
    ...flagData,
    flaggedAt: new Date(),
  });

  return this.save();
};

// ==================== STATIC METHODS ====================

// Get orders by buyer
orderSchema.statics.getBuyerOrders = function (buyerId, status = null) {
  const query = { buyer: buyerId };
  if (status) query.status = status;

  return this.find(query)
    .populate("seller", "firstName lastName displayName profileImage")
    .populate("service", "title")
    .sort({ createdAt: -1 });
};

// Get orders by seller
orderSchema.statics.getSellerOrders = function (sellerId, status = null) {
  const query = { seller: sellerId };
  if (status) query.status = status;

  return this.find(query)
    .populate("buyer", "firstName lastName displayName profileImage")
    .populate("service", "title")
    .sort({ createdAt: -1 });
};

// Get stats for seller
orderSchema.statics.getSellerStats = function (sellerId) {
  return this.aggregate([
    { $match: { seller: sellerId } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        active: {
          $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
        },
        pending: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
        },
        totalRevenue: {
          $sum: {
            $cond: [
              { $eq: ["$payment.status", "paid"] },
              "$pricing.sellerEarnings",
              0,
            ],
          },
        },
        totalEarnings: {
          $sum: "$pricing.sellerEarnings",
        },
        avgRating: { $avg: "$review.rating" },
        totalReviews: {
          $sum: { $cond: [{ $ne: ["$review.rating", null] }, 1, 0] },
        },
      },
    },
  ]);
};

// Get stats for buyer
orderSchema.statics.getBuyerStats = function (buyerId) {
  return this.aggregate([
    { $match: { buyer: buyerId } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        active: {
          $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
        },
        pending: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
        totalSpent: {
          $sum: {
            $cond: [{ $eq: ["$payment.status", "paid"] }, "$pricing.total", 0],
          },
        },
      },
    },
  ]);
};

// Get overdue orders
orderSchema.statics.getOverdue = function () {
  const now = new Date();
  return this.find({
    status: "active",
    "timeline.deadline": { $lt: now },
  })
    .populate("buyer", "email firstName lastName")
    .populate("seller", "email firstName lastName");
};

// Get orders needing attention (disputed, refund pending)
orderSchema.statics.getNeedingAttention = function () {
  return this.find({
    $or: [
      { status: "disputed" },
      { "refund.status": "pending" },
      { status: "suspended" },
    ],
  })
    .populate("buyer", "email firstName lastName")
    .populate("seller", "email firstName lastName");
};

// Search orders (admin)
orderSchema.statics.adminSearch = function (searchTerm, filters = {}) {
  const query = { ...filters };

  if (searchTerm) {
    query.$or = [
      { orderId: { $regex: searchTerm, $options: "i" } },
      { "details.title": { $regex: searchTerm, $options: "i" } },
    ];
  }

  return this.find(query)
    .populate("buyer", "firstName lastName email")
    .populate("seller", "firstName lastName email")
    .populate("service", "title")
    .sort({ createdAt: -1 });
};

// Get monthly revenue stats
orderSchema.statics.getMonthlyRevenue = function (year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  return this.aggregate([
    {
      $match: {
        "payment.status": "paid",
        "payment.paidAt": { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$pricing.total" },
        platformFees: { $sum: "$pricing.platformFee" },
        sellerEarnings: { $sum: "$pricing.sellerEarnings" },
        orderCount: { $sum: 1 },
      },
    },
  ]);
};

const Order = mongoose.model("Order", orderSchema);

export default Order;

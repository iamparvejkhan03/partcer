import mongoose, { Schema } from "mongoose";

const customOfferSchema = new Schema(
  {
    offerId: {
      type: String,
      required: true,
      unique: true,
    },

    // Participants
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Offer details
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },

    // Service reference (optional)
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },

    // Category
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    // Pricing
    pricing: {
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
      includesPlatformFee: {
        type: Boolean,
        default: false,
      },
    },

    // Delivery
    deliveryTime: {
      type: Number, // in days
      required: true,
      min: 1,
    },

    // Revisions
    revisions: {
      type: Number,
      default: 2,
      min: 0,
    },

    // Requirements
    requirements: String,

    // Attachments
    attachments: [
      {
        name: String,
        url: String,
        publicId: String,
        type: String,
        size: Number,
      },
    ],

    // Status
    status: {
      type: String,
      enum: ["draft", "sent", "viewed", "accepted", "declined", "expired"],
      default: "draft",
    },

    // Timeline
    sentAt: Date,
    viewedAt: Date,
    acceptedAt: Date,
    declinedAt: Date,
    expiresAt: Date,

    // Message from seller
    message: String,

    // Buyer's response
    response: {
      message: String,
      respondedAt: Date,
    },

    // Resulting order
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    // Statistics
    stats: {
      isUrgent: {
        type: Boolean,
        default: false,
      },
    },

    // Metadata
    metadata: {
      ip: String,
      userAgent: String,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
// customOfferSchema.index({ offerId: 1 });
customOfferSchema.index({ seller: 1, status: 1 });
customOfferSchema.index({ buyer: 1, status: 1 });
customOfferSchema.index({ expiresAt: 1 });

// Pre-save middleware
customOfferSchema.pre("save", function (next) {
  if (!this.offerId) {
    const prefix = "OFF";
    const date = new Date();
    const random = Math.floor(1000 + Math.random() * 9000);
    this.offerId = `${prefix}-${date.getTime()}-${random}`;
  }

  // Set expiration if not set (7 days by default)
  if (!this.expiresAt) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    this.expiresAt = expiresAt;
  }

  next();
});

// Methods
customOfferSchema.methods.send = function () {
  this.status = "sent";
  this.sentAt = new Date();
  return this.save();
};

customOfferSchema.methods.view = function () {
  if (this.status === "sent") {
    this.status = "viewed";
    this.viewedAt = new Date();
  }
  return this.save();
};

customOfferSchema.methods.accept = function (responseMessage = "") {
  if (!["sent", "viewed"].includes(this.status)) {
    throw new Error("Cannot accept this offer");
  }

  this.status = "accepted";
  this.acceptedAt = new Date();
  this.response = {
    message: responseMessage,
    respondedAt: new Date(),
  };

  return this.save();
};

customOfferSchema.methods.decline = function (reason = "") {
  if (!["sent", "viewed"].includes(this.status)) {
    throw new Error("Cannot decline this offer");
  }

  this.status = "declined";
  this.declinedAt = new Date();
  this.response = {
    message: reason,
    respondedAt: new Date(),
  };

  return this.save();
};

customOfferSchema.methods.isExpired = function () {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Static methods
customOfferSchema.statics.getActiveForBuyer = function (buyerId) {
  return this.find({
    buyer: buyerId,
    status: { $in: ["sent", "viewed"] },
    expiresAt: { $gt: new Date() },
  })
    .populate("seller", "firstName lastName displayName profileImage")
    .sort({ createdAt: -1 });
};

customOfferSchema.statics.getActiveForSeller = function (sellerId) {
  return this.find({
    seller: sellerId,
    status: { $in: ["sent", "viewed"] },
    expiresAt: { $gt: new Date() },
  })
    .populate("buyer", "firstName lastName displayName profileImage")
    .sort({ createdAt: -1 });
};

const CustomOffer = mongoose.model("CustomOffer", customOfferSchema);

export default CustomOffer;

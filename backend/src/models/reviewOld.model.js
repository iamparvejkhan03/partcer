import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    // ==================== BASIC REVIEW INFORMATION ====================
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      minlength: [10, "Comment must be at least 10 characters"],
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
    },
    privateFeedback: {
      type: String,
      trim: true,
      maxlength: [1000, "Private feedback cannot exceed 1000 characters"],
    },

    // ==================== RELATIONSHIPS ====================
    // Who is giving the review
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewerRole: {
      type: String,
      enum: ["buyer", "freelancer"],
      required: true,
    },

    // Who is receiving the review
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    revieweeRole: {
      type: String,
      enum: ["buyer", "freelancer"],
      required: true,
    },

    // Associated Order (required - reviews only come from completed orders)
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // One review per user per order
    },

    // Associated Service (for context)
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    // ==================== ORDER CONTEXT SNAPSHOT ====================
    orderContext: {
      orderId: {
        type: String,
      },
      orderDate: {
        type: Date,
      },
      completionDate: Date,
      packageName: String,
      packagePrice: Number,
      projectTitle: String,
    },

    // ==================== RESPONSE TO REVIEW ====================
    response: {
      comment: {
        type: String,
        trim: true,
        maxlength: [1000, "Response cannot exceed 1000 characters"],
      },
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      respondedAt: Date,
      isEdited: {
        type: Boolean,
        default: false,
      },
      editHistory: [
        {
          comment: String,
          editedAt: Date,
        },
      ],
    },

    // ==================== HELPFUL VOTES ====================
    helpful: {
      count: {
        type: Number,
        default: 0,
      },
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },

    // ==================== REPORTS/FLAGS ====================
    flags: [
      {
        reason: {
          type: String,
          enum: [
            "inappropriate",
            "spam",
            "fake",
            "offensive",
            "conflict_of_interest",
            "other",
          ],
          required: true,
        },
        description: String,
        flaggedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        flaggedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["pending", "reviewed", "dismissed"],
          default: "pending",
        },
      },
    ],

    // ==================== MODERATION ====================
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "flagged"],
      default: "approved", // Auto-approve by default, can be changed for moderation
    },
    moderationHistory: [
      {
        action: {
          type: String,
          enum: ["approved", "rejected", "flagged", "edited", "unflagged"],
        },
        reason: String,
        moderatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        moderatedAt: {
          type: Date,
          default: Date.now,
        },
        previousData: {
          rating: Number,
          comment: String,
        },
      },
    ],

    // Admin edits
    isEditedByAdmin: {
      type: Boolean,
      default: false,
    },
    originalComment: String,
    originalRating: Number,

    // ==================== EDIT INFORMATION ====================
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    editHistory: [
      {
        rating: Number,
        comment: String,
        editedAt: Date,
      },
    ],

    // ==================== METADATA ====================
    ip: String,
    userAgent: String,
    source: {
      type: String,
      enum: ["web", "mobile", "api"],
      default: "web",
    },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ==================== INDEXES ====================
// Ensure one review per user per order (buyer can't review twice, freelancer can't review twice)
reviewSchema.index({ order: 1, reviewer: 1 }, { unique: true });

// For fast lookups
reviewSchema.index({ reviewer: 1, createdAt: -1 });
reviewSchema.index({ reviewee: 1, createdAt: -1 });
reviewSchema.index({ service: 1, status: 1 });
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ "flags.status": 1 });
reviewSchema.index({ createdAt: -1 });

// ==================== VIRTUAL PROPERTIES ====================

// Check if review can be responded to
reviewSchema.virtual("canRespond").get(function () {
  return this.status === "approved" && !this.isDeleted;
});

// Check if review is flagged
reviewSchema.virtual("isFlagged").get(function () {
  return this.flags.some((flag) => flag.status === "pending");
});

// ==================== MIDDLEWARE ====================

// Populate order context before saving
reviewSchema.pre("save", async function (next) {
  try {
    if (this.isNew || this.isModified("order")) {
      const Order = mongoose.model("Order");
      const order = await Order.findById(this.order).populate("service").lean();

      if (!order) {
        throw new Error("Order not found");
      }

      this.orderContext = {
        orderId: order.orderId,
        orderDate: order.createdAt,
        completionDate: order.timeline?.completedAt,
        packageName: order.details?.package?.name,
        packagePrice: order.pricing?.subtotal,
        projectTitle: order.details?.title,
      };

      // Ensure service is set
      if (!this.service) {
        this.service = order.service?._id || order.service;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Update service rating after review is approved (ONLY for buyer reviews)
reviewSchema.post("save", async function (doc) {
  if (
    doc.status === "approved" &&
    !doc.isDeleted &&
    doc.reviewerRole === "buyer"
  ) {
    try {
      const Service = mongoose.model("Service");

      // Update the rating distribution
      await Service.findByIdAndUpdate(doc.service, {
        $inc: {
          reviewCount: 1,
          [`ratingDistribution.${doc.rating}`]: 1,
        },
      });

      // Recalculate average rating from ALL buyer reviews for this service
      const Review = mongoose.model("Review");
      const stats = await Review.aggregate([
        {
          $match: {
            service: doc.service,
            status: "approved",
            isDeleted: false,
            reviewerRole: "buyer", // Only count buyer reviews
          },
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      if (stats.length > 0) {
        await Service.findByIdAndUpdate(doc.service, {
          rating: stats[0].avgRating,
          reviewCount: stats[0].totalReviews,
        });
        console.log(
          `✅ Service rating updated: ${stats[0].avgRating} (${stats[0].totalReviews} buyer reviews)`,
        );
      }
    } catch (error) {
      console.error("Error updating service rating:", error);
    }
  }
});

// Update user rating after review is approved
reviewSchema.post("save", async function (doc) {
  if (
    doc.status === "approved" &&
    !doc.isDeleted &&
    doc.revieweeRole === "freelancer"
  ) {
    try {
      const Review = mongoose.model("Review");

      // Calculate freelancer's average rating
      const stats = await Review.aggregate([
        {
          $match: {
            reviewee: doc.reviewee,
            revieweeRole: "freelancer",
            status: "approved",
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      if (stats.length > 0) {
        const User = mongoose.model("User");
        await User.findByIdAndUpdate(doc.reviewee, {
          rating: stats[0].avgRating,
          reviewCount: stats[0].totalReviews,
        });
      }
    } catch (error) {
      console.error("Error updating user rating:", error);
    }
  }
});

// ==================== INSTANCE METHODS ====================

// Add response to review
reviewSchema.methods.addResponse = async function (comment, userId) {
  this.response = {
    comment,
    respondedBy: userId,
    respondedAt: new Date(),
  };
  return this.save();
};

// Update response
reviewSchema.methods.updateResponse = async function (comment, userId) {
  if (!this.response.respondedBy) {
    throw new Error("No response exists");
  }

  // Save to edit history
  if (!this.response.editHistory) {
    this.response.editHistory = [];
  }

  this.response.editHistory.push({
    comment: this.response.comment,
    editedAt: new Date(),
  });

  this.response.comment = comment;
  this.response.isEdited = true;

  return this.save();
};

// Mark as helpful
reviewSchema.methods.markHelpful = async function (userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count = this.helpful.users.length;
    return this.save();
  }
  return this;
};

// Remove helpful mark
reviewSchema.methods.unmarkHelpful = async function (userId) {
  this.helpful.users = this.helpful.users.filter(
    (id) => id.toString() !== userId.toString(),
  );
  this.helpful.count = this.helpful.users.length;
  return this.save();
};

// Flag review
reviewSchema.methods.flag = async function (flagData, userId) {
  this.flags.push({
    ...flagData,
    flaggedBy: userId,
    flaggedAt: new Date(),
    status: "pending",
  });

  this.status = "flagged";

  return this.save();
};

// Resolve flag
reviewSchema.methods.resolveFlag = async function (
  flagId,
  resolution,
  adminId,
) {
  const flag = this.flags.id(flagId);
  if (flag) {
    flag.status = resolution.status || "reviewed";

    this.moderationHistory.push({
      action: resolution.action || "reviewed",
      reason: resolution.reason,
      moderatedBy: adminId,
      moderatedAt: new Date(),
    });

    // If no other pending flags, update status
    if (!this.flags.some((f) => f.status === "pending")) {
      this.status = resolution.newStatus || "approved";
    }

    return this.save();
  }
  throw new Error("Flag not found");
};

// Moderate review (admin)
reviewSchema.methods.moderate = async function (action, reason, adminId) {
  const previousData = {
    rating: this.rating,
    comment: this.comment,
  };

  switch (action) {
    case "approve":
      this.status = "approved";
      break;
    case "reject":
      this.status = "rejected";
      break;
    case "flag":
      this.status = "flagged";
      break;
    case "edit":
      // Handle edit separately
      break;
  }

  this.moderationHistory.push({
    action,
    reason,
    moderatedBy: adminId,
    moderatedAt: new Date(),
    previousData,
  });

  return this.save();
};

// Edit review (admin)
reviewSchema.methods.adminEdit = async function (editData, adminId) {
  // Store original if not already stored
  if (!this.isEditedByAdmin) {
    this.originalComment = this.comment;
    this.originalRating = this.rating;
  }

  // Save to edit history
  this.editHistory.push({
    rating: this.rating,
    comment: this.comment,
    editedAt: new Date(),
  });

  // Update fields
  if (editData.rating) this.rating = editData.rating;
  if (editData.comment) this.comment = editData.comment;

  this.isEditedByAdmin = true;
  this.isEdited = true;
  this.editedAt = new Date();

  // Add to moderation history
  this.moderationHistory.push({
    action: "edited",
    reason: editData.reason || "Admin edit",
    moderatedBy: adminId,
    moderatedAt: new Date(),
  });

  return this.save();
};

// Soft delete
reviewSchema.methods.softDelete = async function (userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  return this.save();
};

// Restore
reviewSchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = null;
  this.deletedBy = null;
  return this.save();
};

// ==================== STATIC METHODS ====================

// Get reviews for a user (as reviewee)
reviewSchema.statics.getUserReviews = function (
  userId,
  role = null,
  options = {},
) {
  const query = {
    reviewee: userId,
    status: "approved",
    isDeleted: false,
  };

  if (role) {
    query.revieweeRole = role;
  }

  return this.find(query)
    .populate("reviewer", "firstName lastName displayName profileImage")
    .populate("service", "title")
    .sort({ createdAt: -1 })
    .limit(options.limit || 10)
    .skip(options.skip || 0);
};

// Get reviews for a service with pagination and stats
reviewSchema.statics.getServiceReviews = async function (serviceId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  // Get reviews with pagination
  const reviews = await this.find({
    service: serviceId,
    status: "approved",
    isDeleted: false,
    reviewerRole: "buyer"
  })
    .populate("reviewer", "firstName lastName displayName profileImage")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const totalCount = await this.countDocuments({
    service: serviceId,
    status: "approved",
    isDeleted: false,
    reviewerRole: "buyer"
  });

  // Get rating statistics - FIX THIS PART
  const stats = await this.aggregate([
    {
      $match: {
        service: serviceId,
        status: "approved",
        isDeleted: false,
        reviewerRole: "buyer"
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        distribution: {
          $push: "$rating"
        }
      }
    },
    {
      $project: {
        _id: 0,
        averageRating: { $round: ["$averageRating", 1] },
        totalReviews: 1,
        distribution: {
          1: {
            $size: {
              $filter: {
                input: "$distribution",
                cond: { $eq: ["$$this", 1] }
              }
            }
          },
          2: {
            $size: {
              $filter: {
                input: "$distribution",
                cond: { $eq: ["$$this", 2] }
              }
            }
          },
          3: {
            $size: {
              $filter: {
                input: "$distribution",
                cond: { $eq: ["$$this", 3] }
              }
            }
          },
          4: {
            $size: {
              $filter: {
                input: "$distribution",
                cond: { $eq: ["$$this", 4] }
              }
            }
          },
          5: {
            $size: {
              $filter: {
                input: "$distribution",
                cond: { $eq: ["$$this", 5] }
              }
            }
          }
        }
      }
    }
  ]);

  // Return all three objects
  return {
    reviews,
    stats: stats.length > 0 ? stats[0] : {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    },
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      hasMore: skip + reviews.length < totalCount
    }
  };
};

// Get reviews for an order
reviewSchema.statics.getOrderReviews = function (orderId) {
  return this.find({
    order: orderId,
    isDeleted: false,
  })
    .populate(
      "reviewer",
      "firstName lastName displayName profileImage userType",
    )
    .populate(
      "reviewee",
      "firstName lastName displayName profileImage userType",
    );
};

// Get flagged reviews (for admin)
reviewSchema.statics.getFlaggedReviews = function () {
  return this.find({
    "flags.status": "pending",
    isDeleted: false,
  })
    .populate("reviewer", "firstName lastName email")
    .populate("reviewee", "firstName lastName email")
    .populate("flags.flaggedBy", "firstName lastName email")
    .sort({ "flags.flaggedAt": -1 });
};

// Get reviews needing moderation
reviewSchema.statics.getNeedingModeration = function () {
  return this.find({
    status: { $in: ["pending", "flagged"] },
    isDeleted: false,
  })
    .populate("reviewer", "firstName lastName email")
    .populate("reviewee", "firstName lastName email")
    .sort({ createdAt: 1 });
};

// Get review statistics for a user
reviewSchema.statics.getUserStats = async function (userId) {
  const stats = await this.aggregate([
    {
      $match: {
        reviewee: userId,
        status: "approved",
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        ratingCounts: {
          $push: "$rating",
        },
      },
    },
    {
      $project: {
        totalReviews: 1,
        averageRating: { $round: ["$averageRating", 1] },
        ratingDistribution: {
          1: {
            $size: {
              $filter: {
                input: "$ratingCounts",
                cond: { $eq: ["$$this", 1] },
              },
            },
          },
          2: {
            $size: {
              $filter: {
                input: "$ratingCounts",
                cond: { $eq: ["$$this", 2] },
              },
            },
          },
          3: {
            $size: {
              $filter: {
                input: "$ratingCounts",
                cond: { $eq: ["$$this", 3] },
              },
            },
          },
          4: {
            $size: {
              $filter: {
                input: "$ratingCounts",
                cond: { $eq: ["$$this", 4] },
              },
            },
          },
          5: {
            $size: {
              $filter: {
                input: "$ratingCounts",
                cond: { $eq: ["$$this", 5] },
              },
            },
          },
        },
      },
    },
  ]);

  return stats.length > 0 ? stats[0] : null;
};

// Search reviews (admin)
reviewSchema.statics.adminSearch = function (searchTerm, filters = {}) {
  const query = { isDeleted: false, ...filters };

  if (searchTerm) {
    query.$or = [
      { comment: { $regex: searchTerm, $options: "i" } },
      { "orderContext.orderId": { $regex: searchTerm, $options: "i" } },
      { "orderContext.projectTitle": { $regex: searchTerm, $options: "i" } },
    ];
  }

  return this.find(query)
    .populate("reviewer", "firstName lastName email userType")
    .populate("reviewee", "firstName lastName email userType")
    .populate("service", "title")
    .sort({ createdAt: -1 });
};

const Review = mongoose.model("Review", reviewSchema);

export default Review;

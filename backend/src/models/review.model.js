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
            enum: ["student", "mentor"],
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
            enum: ["student", "mentor"],
            required: true,
        },

        // Associated Order (required - reviews only come from completed orders)
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NewOrder",
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
            serviceType: String,
            period: String,
            duration: String,
            amount: Number,
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
            default: "approved",
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
// Ensure one review per user per order (remove unique if you want both parties to review)
reviewSchema.index({ order: 1, reviewer: 1 }, { unique: true });

// For fast lookups
reviewSchema.index({ reviewer: 1, createdAt: -1 });
reviewSchema.index({ reviewee: 1, createdAt: -1 });
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ "flags.status": 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ reviewee: 1, reviewerRole: 1 });
reviewSchema.index({ reviewer: 1, reviewerRole: 1 });

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
            const NewOrder = mongoose.model("NewOrder");
            const order = await NewOrder.findById(this.order).lean();

            if (!order) {
                throw new Error("Order not found");
            }

            this.orderContext = {
                orderId: order.orderId,
                orderDate: order.createdAt,
                completionDate: order.deliveryDetails?.completedAt || order.deliveryDetails?.deliveredAt,
                serviceType: order.serviceType,
                period: order.period,
                duration: order.duration,
                amount: order.amount,
            };
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Update user rating after review is approved
reviewSchema.post("save", async function (doc) {
    if (doc.status === "approved" && !doc.isDeleted) {
        try {
            const User = mongoose.model("User");

            // Calculate reviewee's average rating from ALL their reviews
            const Review = mongoose.model("Review");
            const stats = await Review.aggregate([
                {
                    $match: {
                        reviewee: doc.reviewee,
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
                await User.findByIdAndUpdate(doc.reviewee, {
                    rating: stats[0].avgRating,
                    reviewCount: stats[0].totalReviews,
                });
                console.log(`✅ User rating updated for ${doc.reviewee}: ${stats[0].avgRating} (${stats[0].totalReviews} reviews)`);
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
        isEdited: false,
        editHistory: [],
    };
    return this.save();
};

// Update response
reviewSchema.methods.updateResponse = async function (comment, userId) {
    if (!this.response.respondedBy) {
        throw new Error("No response exists");
    }

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
    if (!this.isEditedByAdmin) {
        this.originalComment = this.comment;
        this.originalRating = this.rating;
    }

    this.editHistory.push({
        rating: this.rating,
        comment: this.comment,
        editedAt: new Date(),
    });

    if (editData.rating) this.rating = editData.rating;
    if (editData.comment) this.comment = editData.comment;

    this.isEditedByAdmin = true;
    this.isEdited = true;
    this.editedAt = new Date();

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
reviewSchema.statics.getUserReviews = function (userId, role = null, options = {}) {
    const query = {
        reviewee: userId,
        status: "approved",
        isDeleted: false,
    };

    if (role) {
        query.revieweeRole = role;
    }

    return this.find(query)
        .populate("reviewer", "firstName lastName displayName profileImage email")
        .populate("order", "orderId serviceType")
        .sort({ createdAt: -1 })
        .limit(options.limit || 10)
        .skip(options.skip || 0);
};

// Get reviews written by a user (as reviewer)
reviewSchema.statics.getReviewsByUser = function (userId, role = null, options = {}) {
    const query = {
        reviewer: userId,
        isDeleted: false,
    };

    if (role) {
        query.reviewerRole = role;
    }

    return this.find(query)
        .populate("reviewee", "firstName lastName displayName profileImage email")
        .populate("order", "orderId serviceType")
        .sort({ createdAt: -1 })
        .limit(options.limit || 10)
        .skip(options.skip || 0);
};

// Get reviews for an order
reviewSchema.statics.getOrderReviews = function (orderId) {
    return this.find({
        order: orderId,
        isDeleted: false,
    })
        .populate("reviewer", "firstName lastName displayName profileImage userType")
        .populate("reviewee", "firstName lastName displayName profileImage userType");
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
                reviewee: new mongoose.Types.ObjectId(userId),
                status: "approved",
                isDeleted: false,
            },
        },
        {
            $group: {
                _id: null,
                totalReviews: { $sum: 1 },
                averageRating: { $avg: "$rating" },
                ratingCounts: { $push: "$rating" },
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

// Get overall platform statistics (admin)
reviewSchema.statics.getPlatformStats = async function (dateFilter = {}) {
    const stats = await this.aggregate([
        { $match: { isDeleted: false, ...dateFilter } },
        {
            $facet: {
                overview: [
                    {
                        $group: {
                            _id: null,
                            totalReviews: { $sum: 1 },
                            averageRating: { $avg: "$rating" },
                            totalHelpful: { $sum: "$helpful.count" },
                            reviewsWithResponse: {
                                $sum: {
                                    $cond: [{ $ifNull: ["$response.respondedBy", false] }, 1, 0],
                                },
                            },
                        },
                    },
                ],
                byRating: [
                    {
                        $group: {
                            _id: "$rating",
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { _id: 1 } },
                ],
                byStatus: [
                    {
                        $group: {
                            _id: "$status",
                            count: { $sum: 1 },
                        },
                    },
                ],
                byRole: [
                    {
                        $group: {
                            _id: "$reviewerRole",
                            count: { $sum: 1 },
                            avgRating: { $avg: "$rating" },
                        },
                    },
                ],
                flaggedStats: [
                    { $match: { "flags.0": { $exists: true } } },
                    {
                        $project: {
                            flagCount: { $size: "$flags" },
                            pendingFlags: {
                                $size: {
                                    $filter: {
                                        input: "$flags",
                                        cond: { $eq: ["$$this.status", "pending"] },
                                    },
                                },
                            },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            totalFlaggedReviews: { $sum: 1 },
                            totalFlags: { $sum: "$flagCount" },
                            pendingFlags: { $sum: "$pendingFlags" },
                        },
                    },
                ],
            },
        },
    ]);

    return stats[0];
};

// Search reviews (admin)
reviewSchema.statics.adminSearch = function (searchTerm, filters = {}) {
    const query = { isDeleted: false, ...filters };

    if (searchTerm) {
        query.$or = [
            { comment: { $regex: searchTerm, $options: "i" } },
            { "orderContext.orderId": { $regex: searchTerm, $options: "i" } },
        ];
    }

    return this.find(query)
        .populate("reviewer", "firstName lastName email userType")
        .populate("reviewee", "firstName lastName email userType")
        .sort({ createdAt: -1 });
};

// ==================== CREATE MODEL ====================
const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default Review;
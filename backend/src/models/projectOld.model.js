import mongoose, { Schema } from "mongoose";

const attachmentSchema = new Schema({
  name: String,
  url: String,
  publicId: String,
  type: String,
  size: Number,
});

const applicantSchema = new Schema({
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  avatar: String,
  title: String,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: {
    type: Number,
    default: 0,
  },
  completedJobs: {
    type: Number,
    default: 0,
  },
  hourlyRate: Number,
  location: String,
  verified: {
    type: Boolean,
    default: true,
  },
  level: {
    type: String,
    enum: ["entry", "intermediate", "expert", "independent", "agency"],
    default: "entry",
  },
  appliedDate: {
    type: Date,
    default: Date.now,
  },
  coverLetter: {
    type: String,
    required: true,
  },
  proposedBudget: {
    type: Number,
    required: true,
    min: 0,
  },
  proposedTimeline: String,
  // attachments: [
  //   {
  //     name: String,
  //     url: String,
  //     publicId: String,
  //     type: String,
  //     size: Number,
  //   },
  // ],
  attachments: [attachmentSchema],
  skills: [String],
  status: {
    type: String,
    enum: ["pending", "shortlisted", "hired", "rejected"],
    default: "pending",
  },
  response: {
    type: {
      type: String,
      enum: ["shortlisted", "hired", "rejected"],
    },
    message: String,
    date: Date,
  },
  viewedByBuyer: {
    type: Boolean,
    default: false,
  },
  viewedAt: Date,
  viewedByFreelancer: {
    type: Boolean,
    default: false,
  },
  unreadMessages: {
    type: Number,
    default: 0,
  },
  lastReadAt: Date,
  // Interview response
  interviewResponse: {
    action: {
      type: String,
      enum: ['accept', 'decline'],
    },
    message: String,
    date: Date,
  },
  interviewDeclined: {
    type: Boolean,
    default: false,
  },
  
  // Withdrawal
  withdrawnDate: Date,
  withdrawalReason: String,
});

const projectSchema = new Schema(
  {
    // ==================== BASIC INFORMATION ====================
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      minlength: [10, "Title must be at least 10 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
    },

    // Category & Subcategory
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    // ==================== BUYER INFORMATION ====================
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==================== SKILLS & REQUIREMENTS ====================
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    experienceLevel: {
      type: String,
      enum: ["entry", "intermediate", "expert"],
      default: "entry",
    },
    location: {
      type: String,
      default: "remote",
    },
    requirements: {
      type: String,
      trim: true,
    },

    // ==================== BUDGET & TIMELINE ====================
    projectType: {
      type: String,
      enum: ["fixed", "hourly"],
      required: true,
      default: "fixed",
    },
    budget: {
      type: Number,
      min: 0,
      validate: {
        validator: function (v) {
          // Required if project type is fixed
          if (this.projectType === "fixed") {
            return v != null && v >= 10;
          }
          return true;
        },
        message:
          "Budget is required and must be at least $10 for fixed price projects",
      },
    },
    minBudget: {
      type: Number,
      min: 0,
    },
    maxBudget: {
      type: Number,
      min: 0,
    },
    hourlyRate: {
      type: Number,
      min: 0,
      validate: {
        validator: function (v) {
          // Required if project type is hourly
          if (this.projectType === "hourly") {
            return v != null && v >= 5;
          }
          return true;
        },
        message: "Hourly rate is required and must be at least $5",
      },
    },
    estimatedHours: {
      type: Number,
      min: 0,
      validate: {
        validator: function (v) {
          // Required if project type is hourly
          if (this.projectType === "hourly") {
            return v != null && v >= 1;
          }
          return true;
        },
        message: "Estimated hours is required",
      },
    },
    duration: {
      type: String,
      enum: [
        "Less than 1 week",
        "1-2 weeks",
        "2-4 weeks",
        "1-3 months",
        "3-6 months",
        "More than 6 months",
      ],
      default: "1-3 months",
    },
    deadline: {
      type: Date,
    },

    // ==================== ADDITIONAL INFORMATION ====================
    additionalInfo: {
      type: String,
      trim: true,
    },
    attachments: [attachmentSchema],

    // ==================== STATUS & PUBLISHING ====================
    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "active",
        "paused",
        "completed",
        "cancelled",
        "expired",
        "suspended",
      ],
      default: "active",
    },
    publishedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: {
      type: Date,
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    isNDARequired: {
      type: Boolean,
      default: false,
    },

    // ==================== APPLICANTS & HIRING ====================
    applicants: [applicantSchema],
    applicantsCount: {
      type: Number,
      default: 0,
    },
    unreadApplications: {
      type: Number,
      default: 0,
    },
    shortlistedCount: {
      type: Number,
      default: 0,
    },
    hiredFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    hiredAt: {
      type: Date,
    },

    // ==================== STATISTICS & ANALYTICS ====================
    views: {
      type: Number,
      default: 0,
    },
    uniqueViews: {
      type: Number,
      default: 0,
    },
    proposals: {
      type: Number,
      default: 0,
    },
    shortlisted: {
      type: Number,
      default: 0,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    saves: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },

    // ==================== REVIEW & RATING (for completed projects) ====================
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    review: {
      type: String,
      trim: true,
    },
    reviewSubmittedAt: {
      type: Date,
    },

    // ==================== SEARCH OPTIMIZATION ====================
    searchKeywords: [
      {
        type: String,
        trim: true,
      },
    ],

    // ==================== TIMESTAMPS ====================
    lastViewAt: {
      type: Date,
    },
    lastApplicationAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ==================== INDEXES ====================
// projectSchema.index({ slug: 1 });
projectSchema.index({ buyer: 1, status: 1 });
projectSchema.index({ category: 1, status: 1 });
projectSchema.index({ skills: 1 });
projectSchema.index({
  title: "text",
  description: "text",
  skills: "text",
  category: "text",
});
projectSchema.index({ budget: 1, duration: 1 });
projectSchema.index({ status: 1, publishedAt: -1 });
projectSchema.index({ featured: 1, featuredUntil: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ "applicants.status": 1 });

// ==================== MIDDLEWARE ====================

// Generate slug before saving
projectSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Set publishedAt when status changes to active
  if (
    this.isModified("status") &&
    this.status === "active" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }

  // Set completedAt when status changes to completed
  if (
    this.isModified("status") &&
    this.status === "completed" &&
    !this.completedAt
  ) {
    this.completedAt = new Date();
  }

  // Set cancelledAt when status changes to cancelled
  if (
    this.isModified("status") &&
    this.status === "cancelled" &&
    !this.cancelledAt
  ) {
    this.cancelledAt = new Date();
  }

  // Update counts when applicants change
  if (this.isModified("applicants")) {
    this.applicantsCount = this.applicants.length;
    this.unreadApplications = this.applicants.filter(
      (a) => a.status === "pending" && !a.viewedByBuyer,
    ).length;
    this.shortlistedCount = this.applicants.filter(
      (a) => a.status === "shortlisted",
    ).length;
    this.proposals = this.applicants.length;
  }

  // Generate search keywords
  if (
    this.isModified("title") ||
    this.isModified("skills") ||
    this.isModified("category")
  ) {
    const keywords = [
      ...this.title
        .toLowerCase()
        .split(" ")
        .filter((w) => w.length > 2),
      ...(this.skills || []).map((s) => s.toLowerCase()),
    ].filter(Boolean);

    this.searchKeywords = [...new Set(keywords)];
  }

  next();
});

// ==================== VIRTUAL PROPERTIES ====================

// Get time remaining until deadline
projectSchema.virtual("timeRemaining").get(function () {
  if (!this.deadline) return null;
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diff = deadline - now;

  if (diff < 0) return "Expired";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} left`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} left`;
  return "Less than an hour left";
});

// Get response rate
projectSchema.virtual("responseRate").get(function () {
  if (this.applicantsCount === 0) return null;
  const responded = this.applicants.filter((a) => a.response).length;
  return Math.round((responded / this.applicantsCount) * 100);
});

// Get average proposal amount
projectSchema.virtual("averageProposal").get(function () {
  if (this.applicantsCount === 0) return null;
  const total = this.applicants.reduce((sum, a) => sum + a.proposedBudget, 0);
  return total / this.applicantsCount;
});

// ==================== INSTANCE METHODS ====================

// Increment view count
projectSchema.methods.incrementViews = function (unique = false) {
  this.views += 1;
  if (unique) this.uniqueViews += 1;
  this.lastViewAt = new Date();
  return this.save();
};

// Increment saves
projectSchema.methods.incrementSaves = function () {
  this.saves += 1;
  return this.save();
};

// Decrement saves
projectSchema.methods.decrementSaves = function () {
  if (this.saves > 0) this.saves -= 1;
  return this.save();
};

// Increment shares
projectSchema.methods.incrementShares = function () {
  this.shares += 1;
  return this.save();
};

// Apply to project (freelancer)
projectSchema.methods.apply = function (applicantData) {
  // Check if already applied
  const existingApplication = this.applicants.find(
    (a) =>
      a.freelancer &&
      a.freelancer.toString() === applicantData.freelancer.toString(),
  );

  if (existingApplication) {
    throw new Error("You have already applied to this project");
  }

  this.applicants.push(applicantData);
  this.applicantsCount = this.applicants.length;
  this.unreadApplications = this.applicants.filter(
    (a) => a.status === "pending",
  ).length;
  this.lastApplicationAt = new Date();

  return this.save();
};

// Update applicant status
projectSchema.methods.updateApplicantStatus = function (
  applicantId,
  status,
  message = "",
) {
  const applicant = this.applicants.id(applicantId);

  if (!applicant) {
    throw new Error("Applicant not found");
  }

  applicant.status = status;
  applicant.response = {
    type: status,
    message,
    date: new Date(),
  };

  // If hiring, update hired freelancer
  if (status === "hired") {
    this.hiredFreelancer = applicant.freelancer;
    this.hiredAt = new Date();
  }

  // Mark as viewed
  applicant.viewedByBuyer = true;
  applicant.viewedAt = new Date();

  return this.save();
};

// Mark application as viewed
projectSchema.methods.markAsViewed = function (applicantId) {
  const applicant = this.applicants.id(applicantId);

  if (applicant && !applicant.viewedByBuyer) {
    applicant.viewedByBuyer = true;
    applicant.viewedAt = new Date();
    this.unreadApplications = Math.max(0, this.unreadApplications - 1);
  }

  return this.save();
};

// Complete project and add review
projectSchema.methods.complete = function (rating, review) {
  this.status = "completed";
  this.completedAt = new Date();
  this.rating = rating;
  this.review = review;
  this.reviewSubmittedAt = new Date();

  return this.save();
};

// Cancel project
projectSchema.methods.cancel = function (reason) {
  this.status = "cancelled";
  this.cancelledAt = new Date();
  this.cancellationReason = reason;

  return this.save();
};

// Check if project is accepting applications
projectSchema.methods.isAcceptingApplications = function () {
  const now = new Date();
  const deadline = this.deadline ? new Date(this.deadline) : null;

  return this.status === "active" && (!deadline || deadline > now);
};

// Get applicant by ID
projectSchema.methods.getApplicant = function (applicantId) {
  return this.applicants.id(applicantId);
};

// Get shortlisted applicants
projectSchema.methods.getShortlisted = function () {
  return this.applicants.filter((a) => a.status === "shortlisted");
};

// Get pending applicants
projectSchema.methods.getPending = function () {
  return this.applicants.filter((a) => a.status === "pending");
};

// ==================== STATIC METHODS ====================

// Get projects by buyer
projectSchema.statics.getBuyerProjects = function (buyerId, status = null) {
  const query = { buyer: buyerId };
  if (status) query.status = status;

  return this.find(query)
    .sort({ createdAt: -1 })
    .populate(
      "hiredFreelancer",
      "firstName lastName displayName profileImage rating",
    );
};

// Get active projects with filters
projectSchema.statics.getActiveProjects = function (filters = {}) {
  const query = { status: "active" };

  if (filters.category) query.category = filters.category;
  if (filters.skills) query.skills = { $in: filters.skills };
  if (filters.minBudget) query.budget = { $gte: filters.minBudget };
  if (filters.maxBudget)
    query.budget = { ...query.budget, $lte: filters.maxBudget };
  if (filters.experienceLevel) query.experienceLevel = filters.experienceLevel;
  if (filters.location) query.location = filters.location;

  return this.find(query)
    .sort({ featured: -1, createdAt: -1 })
    .populate("buyer", "firstName lastName displayName profileImage rating");
};

// Search projects
projectSchema.statics.search = function (searchTerm, filters = {}) {
  const query = { status: "active" };

  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }

  Object.assign(query, filters);

  return this.find(query)
    .sort({ featured: -1, score: { $meta: "textScore" } })
    .populate("buyer", "firstName lastName displayName profileImage rating");
};

// Get similar projects
projectSchema.statics.getSimilar = function (projectId, limit = 4) {
  return this.aggregate([
    { $match: { _id: { $ne: projectId }, status: "active" } },
    { $sample: { size: limit } },
    {
      $lookup: {
        from: "users",
        localField: "buyer",
        foreignField: "_id",
        as: "buyer",
      },
    },
    { $unwind: "$buyer" },
  ]);
};

// Get featured projects
projectSchema.statics.getFeatured = function (limit = 6) {
  const now = new Date();
  return this.find({
    featured: true,
    featuredUntil: { $gt: now },
    status: "active",
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("buyer", "firstName lastName displayName profileImage");
};

// Get urgent projects
projectSchema.statics.getUrgent = function (limit = 6) {
  return this.find({
    isUrgent: true,
    status: "active",
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("buyer", "firstName lastName displayName profileImage");
};

// Get project stats for dashboard
projectSchema.statics.getStats = function (buyerId) {
  return this.aggregate([
    { $match: { buyer: buyerId, status: { $ne: "archived" } } },
    {
      $group: {
        _id: null,
        active: {
          $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
        },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
        },
        draft: {
          $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
        },
        pending: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
        totalApplicants: { $sum: "$applicantsCount" },
        totalSpent: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, "$budget", 0],
          },
        },
        totalViews: { $sum: "$views" },
        totalProposals: { $sum: "$proposals" },
      },
    },
  ]);
};

// Admin: Get all projects with filters
projectSchema.statics.adminGetAll = function (
  filters = {},
  page = 1,
  limit = 20,
) {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.buyer) query.buyer = filters.buyer;
  if (filters.category) query.category = filters.category;
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  const skip = (Number(page) - 1) * Number(limit);

  return this.find(query)
    .populate("buyer", "firstName lastName email displayName profileImage")
    .populate("hiredFreelancer", "firstName lastName displayName profileImage")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
};

const Project = mongoose.model("Project", projectSchema);

export default Project;

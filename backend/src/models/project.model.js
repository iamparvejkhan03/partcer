import mongoose, { Schema } from "mongoose";

// Proposal schema for freelancer applications
const proposalSchema = new Schema({
    freelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    freelancerName: {
        type: String,
        required: true,
    },
    freelancerAvatar: String,
    proposal: {
        type: String,
        required: true,
        trim: true,
    },
    selectedPeriod: {
        type: String,
        enum: ["one_time", "per_day", "weekly", "monthly"],
    },
    selectedDuration: {
        type: String,
        enum: ["standard", "full_day"],
    },
    selectedService: {
        type: String,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: Date,
});

// Main Project Schema
const projectSchema = new Schema(
    {
        // ==================== BASIC INFORMATION ====================
        title: {
            type: String,
            required: [true, "Project title is required"],
            trim: true,
            minlength: [10, "Title must be at least 10 characters"],
            maxlength: [150, "Title cannot exceed 150 characters"],
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
            trim: true,
        },

        // ==================== CATEGORY & SUBCATEGORY ====================
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Category is required"],
        },
        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },

        // ==================== SERVICE TYPE ====================
        service: {
            type: String,
            enum: ["Job Support (Mentoring)", "Skill Training", "Mock Interview Support"],
            required: [true, "Service type is required"],
        },

        // ==================== PERIOD & DURATION ====================
        period: {
            type: String,
            enum: ["one_time", "per_day", "weekly", "monthly"],
            required: [true, "Period is required"],
        },
        duration: {
            type: String,
            enum: ["standard", "full_day"],
            required: [true, "Duration is required"],
        },

        // Duration display text based on period and duration
        durationDisplay: {
            type: String,
        },

        // ==================== SKILLS ====================
        skills: [
            {
                type: String,
                trim: true,
            },
        ],

        // ==================== BUYER/STUDENT ====================
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // ==================== STATUS ====================
        status: {
            type: String,
            enum: ["active", "filled", "completed", "cancelled", "draft"],
            default: "active",
        },

        // ==================== PROPOSALS ====================
        proposals: [proposalSchema],
        proposalsCount: {
            type: Number,
            default: 0,
        },

        // ==================== HIRED FREELANCER ====================
        hiredFreelancer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        hiredAt: Date,

        // ==================== STATS ====================
        views: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ==================== INDEXES ====================
// projectSchema.index({ slug: 1 });
projectSchema.index({ buyer: 1, status: 1 });
projectSchema.index({ category: 1, status: 1 });
projectSchema.index({ skills: 1 });
projectSchema.index({ title: "text", description: "text" });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ status: 1, createdAt: -1 });

// ==================== MIDDLEWARE ====================

// Generate slug before saving
projectSchema.pre("save", function (next) {
    if (this.isModified("title")) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }

    // Generate duration display text
    if (this.isModified("period") || this.isModified("duration")) {
        const periodLabels = {
            one_time: "One-time",
            per_day: "Per day",
            weekly: "Weekly",
            monthly: "Monthly",
        };
        const durationLabels = {
            standard: this.period === "one_time" ? "Single session" : "Standard (2-3 hrs)",
            full_day: "Full day (6-8 hrs)",
        };
        this.durationDisplay = `${periodLabels[this.period]} - ${durationLabels[this.duration]}`;
    }

    next();
});

// Update proposals count
projectSchema.pre("save", function (next) {
    if (this.isModified("proposals")) {
        this.proposalsCount = this.proposals.length;
    }
    next();
});

// ==================== INSTANCE METHODS ====================

// Increment view count
projectSchema.methods.incrementViews = async function () {
    this.views += 1;
    return this.save();
};

// Add proposal (freelancer applies)
projectSchema.methods.addProposal = async function (
    freelancerId,
    freelancerName,
    freelancerAvatar,
    proposal,
    selectedPeriod,
    selectedDuration,
    selectedService
) {
    // Check if already applied
    const existingProposal = this.proposals.find(
        (p) => p.freelancer.toString() === freelancerId.toString()
    );

    if (existingProposal) {
        throw new Error("You have already submitted a proposal for this project");
    }

    this.proposals.push({
        freelancer: freelancerId,
        freelancerName,
        freelancerAvatar,
        proposal,
        selectedPeriod,
        selectedDuration,
        selectedService,
        createdAt: new Date(),
        status: "pending"
    });

    this.proposalsCount = this.proposals.length;
    return this.save();
};

// Update proposal status
projectSchema.methods.updateProposalStatus = async function (proposalId, status) {
    const proposal = this.proposals.id(proposalId);
    if (!proposal) {
        throw new Error("Proposal not found");
    }

    proposal.status = status;
    proposal.updatedAt = new Date();

    // If accepting, mark project as filled and hire the freelancer
    if (status === "accepted") {
        this.status = "filled";
        this.hiredFreelancer = proposal.freelancer;
        this.hiredAt = new Date();
    }

    return this.save();
};

// Check if freelancer has already applied
projectSchema.methods.hasApplied = function(freelancerId) {
  return this.proposals.some(
    (p) => p.freelancer.toString() === freelancerId.toString()
  );
};

// ==================== STATIC METHODS ====================

// Get active projects with filters
projectSchema.statics.getActiveProjects = async function (filters = {}, page = 1, limit = 10) {
    const query = { status: "active" };

    if (filters.category) query.category = filters.category;
    if (filters.subCategory) query.subCategory = filters.subCategory;
    if (filters.service) query.service = filters.service;
    if (filters.period) query.period = filters.period;
    if (filters.skills) query.skills = { $in: filters.skills };
    if (filters.search) {
        query.$text = { $search: filters.search };
    }

    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
        this.find(query)
            .populate("buyer", "firstName lastName displayName profileImage")
            .populate("category", "name")
            .populate("subCategory", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        this.countDocuments(query),
    ]);

    return { projects, total, pages: Math.ceil(total / limit) };
};

// Get projects by buyer
projectSchema.statics.getBuyerProjects = async function (buyerId, status = null) {
    const query = { buyer: buyerId };
    if (status) query.status = status;

    return this.find(query)
        .populate("hiredFreelancer", "firstName lastName displayName profileImage")
        .populate("category", "name")
        .populate("subCategory", "name")
        .sort({ createdAt: -1 });
};

const Project = mongoose.model("Project", projectSchema);
export default Project;
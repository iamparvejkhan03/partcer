import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadFile,
  deleteFileByUrl,
  deleteMultipleFiles,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";

// ==================== HELPER FUNCTIONS ====================

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const validateSkills = (skills) => {
  if (!skills || skills.length === 0) {
    throw new ApiError(400, "At least one skill is required");
  }
  if (skills.length > 10) {
    throw new ApiError(400, "Maximum 10 skills allowed");
  }
  return skills;
};

const validateBudget = (projectType, budget, hourlyRate, estimatedHours) => {
  if (projectType === "fixed") {
    if (!budget || budget < 10) {
      throw new ApiError(
        400,
        "Budget must be at least $10 for fixed price projects",
      );
    }
  } else {
    if (!hourlyRate || hourlyRate < 5) {
      throw new ApiError(400, "Hourly rate must be at least $5");
    }
    if (!estimatedHours || estimatedHours < 1) {
      throw new ApiError(400, "Estimated hours must be at least 1");
    }
  }
};

// ==================== CREATE PROJECT ====================

const createProject = asyncHandler(async (req, res) => {
  const {
    title,
    category,
    subCategory,
    description,
    skills,
    experienceLevel,
    location,
    projectType,
    budget,
    hourlyRate,
    estimatedHours,
    duration,
    additionalInfo,
    requirements,
  } = JSON.parse(req.body.data || "{}");

  // Validation
  if (!title || !category || !description || !projectType) {
    throw new ApiError(400, "Missing required fields");
  }

  // Validate skills
  const validatedSkills = validateSkills(skills);

  // Validate budget
  validateBudget(projectType, budget, hourlyRate, estimatedHours);

  // Check if slug is unique
  const slug = generateSlug(title);
  const existingProject = await Project.findOne({ slug });
  if (existingProject) {
    throw new ApiError(400, "A project with this title already exists");
  }

  // Handle attachments
  const attachments = [];
  if (req.files && req.files.length > 0) {
    if (req.files.length > 5) {
      throw new ApiError(400, "Maximum 5 files allowed");
    }

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new ApiError(400, `File ${file.originalname} exceeds 10MB limit`);
      }

      try {
        const result = await uploadFile(
          file.buffer,
          `projects/${slug}/attachments/${Date.now()}-${file.originalname}`,
        );
        attachments.push({
          name: file.originalname,
          url: result.secure_url,
          publicId: result.public_id,
          type: file.mimetype,
          size: file.size,
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        throw new ApiError(500, "Failed to upload attachments");
      }
    }
  }

  // Calculate deadline based on duration
  let deadline = null;
  if (duration) {
    const now = new Date();
    switch (duration) {
      case "Less than 1 week":
        deadline = new Date(now.setDate(now.getDate() + 7));
        break;
      case "1-2 weeks":
        deadline = new Date(now.setDate(now.getDate() + 14));
        break;
      case "2-4 weeks":
        deadline = new Date(now.setDate(now.getDate() + 28));
        break;
      case "1-3 months":
        deadline = new Date(now.setMonth(now.getMonth() + 3));
        break;
      case "3-6 months":
        deadline = new Date(now.setMonth(now.getMonth() + 6));
        break;
      case "More than 6 months":
        deadline = new Date(now.setMonth(now.getMonth() + 12));
        break;
      default:
        deadline = null;
    }
  }

  // Create project
  const project = await Project.create({
    title,
    slug,
    description,
    category,
    subCategory: subCategory || null,
    skills: validatedSkills,
    experienceLevel: experienceLevel || "entry",
    location: location || "remote",
    projectType,
    budget: projectType === "fixed" ? budget : null,
    hourlyRate: projectType === "hourly" ? hourlyRate : null,
    estimatedHours: projectType === "hourly" ? estimatedHours : null,
    duration,
    deadline,
    additionalInfo: additionalInfo || "",
    requirements: requirements || "",
    attachments,
    buyer: req.user._id,
  });

  // Populate buyer info
  await project.populate(
    "buyer",
    "firstName lastName displayName profileImage",
  );

  return res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully"));
});

// ==================== GET PROJECTS (with filters) ====================

const getProjects = asyncHandler(async (req, res) => {
  const {
    category,
    subCategory,
    buyer,
    status,
    minBudget,
    maxBudget,
    experienceLevel,
    location,
    skills,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = req.query;

  const query = {};

  // Filter by buyer (for buyer's own projects)
  if (buyer) {
    query.buyer = buyer;
  }

  // Filter by status
  if (status) {
    if (Array.isArray(status)) {
      query.status = { $in: status };
    } else {
      query.status = status;
    }
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by subCategory
  if (subCategory) {
    query.subCategory = subCategory;
  }

  // Filter by experience level
  if (experienceLevel) {
    query.experienceLevel = experienceLevel;
  }

  // Filter by location
  if (location) {
    query.location = location;
  }

  // Filter by skills
  if (skills) {
    const skillsArray = Array.isArray(skills) ? skills : skills.split(",");
    query.skills = { $in: skillsArray };
  }

  // Filter by budget range
  if (minBudget || maxBudget) {
    query.budget = {};
    if (minBudget) query.budget.$gte = Number(minBudget);
    if (maxBudget) query.budget.$lte = Number(maxBudget);
  }

  // Search by text
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const projects = await Project.find(query)
    .populate("buyer", "firstName lastName displayName profileImage rating")
    .populate(
      "hiredFreelancer",
      "firstName lastName displayName profileImage rating",
    )
    .populate("category", "name")
    .populate("subCategory", "name")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await Project.countDocuments(query);

  // Get stats for filters
  const stats = await Project.aggregate([
    { $match: { status: "active" } },
    {
      $group: {
        _id: null,
        minBudget: { $min: "$budget" },
        maxBudget: { $max: "$budget" },
        avgBudget: { $avg: "$budget" },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        projects,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
        filters: {
          budgetRange: stats[0] || { minBudget: 0, maxBudget: 0, avgBudget: 0 },
        },
      },
      "Projects fetched successfully",
    ),
  );
});

// ==================== GET PROJECT BY SLUG ====================

const getProjectBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const project = await Project.findOne({ slug })
    .populate(
      "buyer",
      "firstName lastName displayName profileImage email phone country city createdAt lastLogin isVerified languages englishLevel bio",
    )
    .populate(
      "hiredFreelancer",
      "firstName lastName displayName profileImage rating",
    )
    .populate("category", "name")
    .populate("subCategory", "name");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Increment view count (if not the buyer viewing)
  if (!req.user || req.user._id.toString() !== project.buyer._id.toString()) {
    await project.incrementViews();
  }

  // Get similar projects
  const similarProjects = await Project.findSimilar(project._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        project,
        similar: similarProjects,
      },
      "Project fetched successfully",
    ),
  );
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId)
    .populate(
      "buyer",
      "firstName lastName displayName profileImage email phone country city createdAt lastLogin isVerified languages englishLevel bio",
    )
    .populate(
      "hiredFreelancer",
      "firstName lastName displayName profileImage rating",
    )
    .populate("category", "name")
    .populate("subCategory", "name");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Increment view count (if not the buyer viewing)
  if (!req.user || req.user._id.toString() !== project.buyer._id.toString()) {
    await project.incrementViews();
  }

  // Get similar projects
  //   const similarProjects = await Project.findSimilar(project._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        project,
        // similar: similarProjects,
      },
      "Project fetched successfully",
    ),
  );
});

// ==================== GET BUYER PROJECTS ====================

const getBuyerProjects = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const buyerId = req.user._id;

  const query = { buyer: buyerId };
  if (status) {
    query.status = status;
  }

  const projects = await Project.find(query)
    .populate(
      "hiredFreelancer",
      "firstName lastName displayName profileImage rating",
    )
    .populate("category", "name")
    .populate("subCategory", "name")
    .sort({ createdAt: -1 });

  // Get stats
  const statsResult = await Project.getStats(buyerId);
  const stats = statsResult[0] || {
    active: 0,
    completed: 0,
    cancelled: 0,
    draft: 0,
    pending: 0,
    totalApplicants: 0,
    totalSpent: 0,
    totalViews: 0,
    totalProposals: 0,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        projects,
        stats,
      },
      "Buyer projects fetched successfully",
    ),
  );
});

// ==================== UPDATE PROJECT ====================

const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const updates = JSON.parse(req.body.data || "{}");

  // Find project by slug
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Check ownership
  if (
    project.buyer.toString() !== req.user._id.toString() &&
    req.user.userType !== "admin"
  ) {
    throw new ApiError(403, "You don't have permission to update this project");
  }

  // Validate skills if being updated
  if (updates.skills) {
    updates.skills = validateSkills(updates.skills);
  }

  // Validate budget if being updated
  if (
    updates.projectType ||
    updates.budget ||
    updates.hourlyRate ||
    updates.estimatedHours
  ) {
    validateBudget(
      updates.projectType || project.projectType,
      updates.budget !== undefined ? updates.budget : project.budget,
      updates.hourlyRate !== undefined
        ? updates.hourlyRate
        : project.hourlyRate,
      updates.estimatedHours !== undefined
        ? updates.estimatedHours
        : project.estimatedHours,
    );
  }

  // Handle removed attachments
  if (updates.removedAttachments && updates.removedAttachments.length > 0) {
    // Filter out removed attachments
    const remainingAttachments = project.attachments.filter(
      (att) => !updates.removedAttachments.includes(att.publicId),
    );

    // Delete from Cloudinary
    try {
      await deleteMultipleFiles(updates.removedAttachments);
    } catch (error) {
      console.error("Error deleting attachments:", error);
    }

    updates.attachments = remainingAttachments;
  }

  // Handle new attachments
  if (req.files && req.files.length > 0) {
    const currentTotal = project.attachments.length;
    if (currentTotal + req.files.length > 5) {
      throw new ApiError(400, "Maximum 5 files allowed");
    }

    const newAttachments = [...(updates.attachments || project.attachments)];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new ApiError(400, `File ${file.originalname} exceeds 10MB limit`);
      }

      try {
        const result = await uploadFile(
          file.buffer,
          `projects/${project.slug}/attachments/${Date.now()}-${file.originalname}`,
        );
        newAttachments.push({
          name: file.originalname,
          url: result.secure_url,
          publicId: result.public_id,
          type: file.mimetype,
          size: file.size,
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        throw new ApiError(500, "Failed to upload attachments");
      }
    }

    updates.attachments = newAttachments;
  }

  // Update deadline if duration changed
  if (updates.duration && updates.duration !== project.duration) {
    const now = new Date();
    switch (updates.duration) {
      case "Less than 1 week":
        updates.deadline = new Date(now.setDate(now.getDate() + 7));
        break;
      case "1-2 weeks":
        updates.deadline = new Date(now.setDate(now.getDate() + 14));
        break;
      case "2-4 weeks":
        updates.deadline = new Date(now.setDate(now.getDate() + 28));
        break;
      case "1-3 months":
        updates.deadline = new Date(now.setMonth(now.getMonth() + 3));
        break;
      case "3-6 months":
        updates.deadline = new Date(now.setMonth(now.getMonth() + 6));
        break;
      case "More than 6 months":
        updates.deadline = new Date(now.setMonth(now.getMonth() + 12));
        break;
      default:
        updates.deadline = null;
    }
  }

  // Update title and regenerate slug if title changed
  if (updates.title && updates.title !== project.title) {
    updates.slug = generateSlug(updates.title);

    // Check if new slug is unique
    const existingProject = await Project.findOne({
      slug: updates.slug,
      _id: { $ne: project._id },
    });
    if (existingProject) {
      throw new ApiError(400, "A project with this title already exists");
    }
  }

  // Remove temporary fields from updates
  delete updates.removedAttachments;

  // Update project
  Object.assign(project, updates);
  await project.save();

  await project.populate(
    "buyer",
    "firstName lastName displayName profileImage",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});

// ==================== DELETE PROJECT ====================

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Check ownership
  if (
    project.buyer.toString() !== req.user._id.toString() &&
    req.user.userType !== "admin"
  ) {
    throw new ApiError(403, "You don't have permission to delete this project");
  }

  // Check if project has active applications or is in progress
  if (project.status === "active" && project.applicantsCount > 0) {
    throw new ApiError(400, "Cannot delete project with active applications");
  }

  // Delete attachments from Cloudinary
  if (project.attachments && project.attachments.length > 0) {
    const publicIds = project.attachments.map((att) => att.publicId);
    try {
      await deleteMultipleFiles(publicIds);
    } catch (error) {
      console.error("Error deleting attachments:", error);
      // Continue even if deletion fails
    }
  }

  // Soft delete by archiving (or use remove() for hard delete)
  project.status = "archived";
  await project.save();

  // For hard delete, uncomment below:
  // await project.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project deleted successfully"));
});

// ==================== TOGGLE PROJECT STATUS ====================

const toggleProjectStatus = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { status } = req.body;

  if (
    ![
      "draft",
      "pending",
      "active",
      "paused",
      "completed",
      "cancelled",
      "suspended",
    ].includes(status)
  ) {
    throw new ApiError(400, "Invalid status");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Check ownership
  if (project.buyer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You don't have permission to update this project");
  }

  // Validation for status changes
  if (status === "active" && project.status === "draft") {
    // Check if required fields are filled
    if (
      !project.title ||
      !project.description ||
      !project.category ||
      !project.skills ||
      !project.skills.length
    ) {
      throw new ApiError(
        400,
        "Please complete all required fields before publishing",
      );
    }
  }

  if (status === "completed" && project.status !== "active") {
    throw new ApiError(400, "Only active projects can be marked as completed");
  }

  project.status = status;
  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, project, `Project ${status} successfully`));
});

// ==================== GET PROJECT APPLICANTS ====================

const getProjectApplicants = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { status } = req.query;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Check ownership
  if (
    project.buyer.toString() !== req.user._id.toString() &&
    req.user.userType !== "admin"
  ) {
    throw new ApiError(403, "You don't have permission to view applicants");
  }

  let applicants = project.applicants;

  // Filter by status if provided
  if (status) {
    applicants = applicants.filter((a) => a.status === status);
  }

  // Sort by applied date (newest first)
  applicants.sort((a, b) => new Date(b?.appliedDate) - new Date(a?.appliedDate));

  // Get stats
  const stats = {
    total: project.applicantsCount,
    pending: project.applicants.filter((a) => a.status === "pending").length,
    shortlisted: project.applicants.filter((a) => a.status === "shortlisted")
      .length,
    hired: project.applicants.filter((a) => a.status === "hired").length,
    rejected: project.applicants.filter((a) => a.status === "rejected").length,
    unread: project.unreadApplications,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        applicants,
        stats,
      },
      "Applicants fetched successfully",
    ),
  );
});

// ==================== UPDATE APPLICANT STATUS ====================

const updateApplicantStatus = asyncHandler(async (req, res) => {
  const { projectId, applicantId } = req.params;
  const { action, message } = req.body;

  if (!["shortlisted", "hired", "rejected"].includes(action)) {
    throw new ApiError(400, "Invalid action");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Check ownership
  if (project.buyer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You don't have permission to update applicants");
  }

  // Check if project is active
  if (project.status !== "active") {
    throw new ApiError(400, "Can only update applicants for active projects");
  }

  // If hiring, check if already hired someone else
  if (action === "hired" && project.hiredFreelancer) {
    throw new ApiError(400, "You have already hired someone for this project");
  }

  await project.updateApplicantStatus(applicantId, action, message);

  // Get updated applicant
  const updatedApplicant = project.applicants.id(applicantId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedApplicant,
        `Applicant ${action} successfully`,
      ),
    );
});

// ==================== MARK APPLICANT AS VIEWED ====================

const markApplicantViewed = asyncHandler(async (req, res) => {
  const { projectId, applicantId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Check ownership
  if (project.buyer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You don't have permission");
  }

  await project.markAsViewed(applicantId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Application marked as viewed"));
});

// ==================== APPLY TO PROJECT (Freelancer) ====================

const applyToProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const {
    coverLetter,
    proposedBudget,
    proposedTimeline,
    experience,
    relevantWork,
    questions,
    skills,
  } = req.body;

  if (!coverLetter || !proposedBudget || !proposedTimeline) {
    throw new ApiError(
      400,
      "Cover letter, proposed budget, and proposed timeline are required",
    );
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Check if project is accepting applications
  if (!project.isAcceptingApplications()) {
    throw new ApiError(400, "This project is not accepting applications");
  }

  // Get freelancer details
  const freelancer = await User.findById(req.user._id);

  if (!freelancer || freelancer.userType !== "freelancer") {
    throw new ApiError(403, "Only freelancers can apply to projects");
  }

  // Handle attachments from req.files
  const attachments = [];
  if (req.files && req.files.length > 0) {
    if (req.files.length > 3) {
      throw new ApiError(400, "Maximum 3 files allowed");
    }

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        throw new ApiError(400, `File ${file.originalname} exceeds 5MB limit`);
      }

      try {
        const result = await uploadFile(file.buffer, file.originalname);

        attachments.push({
          name: file.originalname,
          url: result.secure_url,
          publicId: result.public_id,
          type: file.mimetype,
          size: file.size,
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        throw new ApiError(500, "Failed to upload attachments");
      }
    }
  }

  // Parse skills if sent as JSON string
  let parsedSkills = freelancer.skills || [];
  if (skills) {
    try {
      parsedSkills = typeof skills === "string" ? JSON.parse(skills) : skills;
    } catch (e) {
      parsedSkills = skills.split(",").map((s) => s.trim());
    }
  }

  // Determine freelancer level - FIX: Map to valid enum values
  let freelancerLevel = "entry"; // default
  if (freelancer.freelancerType) {
    // Map your freelancerType to the enum values
    const levelMap = {
      entry: "entry",
      beginner: "entry",
      intermediate: "intermediate",
      expert: "expert",
      senior: "expert",
      independent: "intermediate", // Map 'independent' to 'intermediate' or whatever is appropriate
      agency: "expert", // Map 'agency' to 'expert' or whatever is appropriate
    };
    freelancerLevel = levelMap[freelancer.freelancerType] || "entry";
  }

  // Prepare applicant data
  const applicantData = {
    freelancer: freelancer._id,
    name:
      freelancer.displayName ||
      `${freelancer.firstName || ""} ${freelancer.lastName || ""}`.trim() ||
      "Freelancer",
    avatar: freelancer.profileImage,
    title: freelancer.title || freelancer.freelancerType,
    rating: freelancer.rating || 0,
    reviews: freelancer.reviewCount || 0,
    completedJobs: freelancer.completedJobs || 0,
    hourlyRate: freelancer.hourlyRate,
    location: freelancer.location || freelancer.country,
    verified: freelancer.isVerified || false,
    level: freelancerLevel, // Use mapped value
    coverLetter,
    proposedBudget: Number(proposedBudget),
    proposedTimeline,
    experience: experience || "",
    relevantWork: relevantWork || "",
    questions: questions || "",
    attachments,
    skills: parsedSkills,
  };

  await project.apply(applicantData);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { application: applicantData },
        "Application submitted successfully",
      ),
    );
});

// ==================== COMPLETE PROJECT ====================

const completeProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { rating, review } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Check ownership
  if (project.buyer.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You don't have permission to complete this project",
    );
  }

  // Check if project is active
  if (project.status !== "active") {
    throw new ApiError(400, "Only active projects can be completed");
  }

  // Check if a freelancer was hired
  if (!project.hiredFreelancer) {
    throw new ApiError(
      400,
      "Cannot complete a project without a hired freelancer",
    );
  }

  await project.complete(rating, review);

  // Update freelancer's stats
  await User.findByIdAndUpdate(project.hiredFreelancer, {
    $inc: { completedJobs: 1, totalRevenue: project.budget },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project completed successfully"));
});

// ==================== DUPLICATE PROJECT ====================

const duplicateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const originalProject = await Project.findById(projectId);

  if (!originalProject) {
    throw new ApiError(404, "Project not found");
  }

  // Check ownership
  if (originalProject.buyer.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You don't have permission to duplicate this project",
    );
  }

  // Create new slug
  const newSlug = generateSlug(`${originalProject.title} (Copy)`);

  // Create duplicate (without applicants and stats)
  const duplicateData = originalProject.toObject();
  delete duplicateData._id;
  delete duplicateData.__v;
  delete duplicateData.slug;
  delete duplicateData.applicants;
  delete duplicateData.applicantsCount;
  delete duplicateData.unreadApplications;
  delete duplicateData.shortlistedCount;
  delete duplicateData.hiredFreelancer;
  delete duplicateData.hiredAt;
  delete duplicateData.views;
  delete duplicateData.uniqueViews;
  delete duplicateData.proposals;
  delete duplicateData.shortlisted;
  delete duplicateData.impressions;
  delete duplicateData.clicks;
  delete duplicateData.saves;
  delete duplicateData.shares;
  delete duplicateData.rating;
  delete duplicateData.review;
  delete duplicateData.reviewSubmittedAt;
  delete duplicateData.completedAt;
  delete duplicateData.cancelledAt;
  delete duplicateData.createdAt;
  delete duplicateData.updatedAt;

  duplicateData.title = `${originalProject.title} (Copy)`;
  duplicateData.slug = newSlug;
  duplicateData.status = "draft";
  duplicateData.publishedAt = null;
  duplicateData.lastViewAt = null;
  duplicateData.lastApplicationAt = null;

  const duplicatedProject = await Project.create(duplicateData);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        duplicatedProject,
        "Project duplicated successfully",
      ),
    );
});

// ==================== INCREMENT VIEWS ====================

const incrementViews = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { unique } = req.query;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  await project.incrementViews(unique === "true");

  return res
    .status(200)
    .json(new ApiResponse(200, { views: project.views }, "Views incremented"));
});

// ==================== INCREMENT SAVES ====================

const incrementSaves = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  await project.incrementSaves();

  return res
    .status(200)
    .json(new ApiResponse(200, { saves: project.saves }, "Project saved"));
});

// ==================== DECREMENT SAVES ====================

const decrementSaves = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  await project.decrementSaves();

  return res
    .status(200)
    .json(new ApiResponse(200, { saves: project.saves }, "Project unsaved"));
});

// ==================== INCREMENT SHARES ====================

const incrementShares = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  await project.incrementShares();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { shares: project.shares }, "Shares incremented"),
    );
});

// ==================== SEARCH PROJECTS (advanced) ====================

const searchProjects = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    minBudget,
    maxBudget,
    experienceLevel,
    location,
    skills,
    sortBy = "relevance",
    page = 1,
    limit = 20,
  } = req.query;

  const pipeline = [];

  // Match stage for active projects
  const match = { status: "active" };

  // Text search
  if (q) {
    pipeline.push({
      $match: {
        $text: { $search: q },
      },
    });

    // Add text score for relevance sorting
    if (sortBy === "relevance") {
      pipeline.push({
        $addFields: {
          score: { $meta: "textScore" },
        },
      });
    }
  }

  // Category filter
  if (category) {
    match.category = category;
  }

  // Budget range filter
  if (minBudget || maxBudget) {
    match.budget = {};
    if (minBudget) match.budget.$gte = Number(minBudget);
    if (maxBudget) match.budget.$lte = Number(maxBudget);
  }

  // Experience level filter
  if (experienceLevel) {
    match.experienceLevel = experienceLevel;
  }

  // Location filter
  if (location) {
    match.location = location;
  }

  // Skills filter
  if (skills) {
    const skillsArray = Array.isArray(skills) ? skills : skills.split(",");
    match.skills = { $in: skillsArray };
  }

  pipeline.push({ $match: match });

  // Lookup buyer info
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "buyer",
      foreignField: "_id",
      as: "buyerInfo",
    },
  });

  pipeline.push({
    $unwind: {
      path: "$buyerInfo",
      preserveNullAndEmptyArrays: true,
    },
  });

  // Sorting
  const sortStage = {};
  switch (sortBy) {
    case "budget_asc":
      sortStage.budget = 1;
      break;
    case "budget_desc":
      sortStage.budget = -1;
      break;
    case "newest":
      sortStage.createdAt = -1;
      break;
    case "oldest":
      sortStage.createdAt = 1;
      break;
    case "applicants":
      sortStage.applicantsCount = -1;
      break;
    case "relevance":
      if (q) {
        sortStage.score = { $meta: "textScore" };
      } else {
        sortStage.createdAt = -1;
      }
      break;
    default:
      sortStage.createdAt = -1;
  }

  if (Object.keys(sortStage).length > 0) {
    pipeline.push({ $sort: sortStage });
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: Number(limit) });

  // Project fields
  pipeline.push({
    $project: {
      title: 1,
      slug: 1,
      description: 1,
      budget: 1,
      projectType: 1,
      duration: 1,
      category: 1,
      subCategory: 1,
      skills: 1,
      experienceLevel: 1,
      location: 1,
      applicantsCount: 1,
      createdAt: 1,
      deadline: 1,
      isUrgent: 1,
      featured: 1,
      "buyerInfo._id": 1,
      "buyerInfo.firstName": 1,
      "buyerInfo.lastName": 1,
      "buyerInfo.displayName": 1,
      "buyerInfo.profileImage": 1,
      "buyerInfo.rating": 1,
      score: { $meta: "textScore" },
    },
  });

  const projects = await Project.aggregate(pipeline);

  // Get total count for pagination
  const countPipeline = [{ $match: match }, { $count: "total" }];
  const countResult = await Project.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        projects,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "Search results fetched successfully",
    ),
  );
});

// ==================== GET PROJECT STATS (for buyer) ====================

const getProjectStats = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Check ownership
  if (
    project.buyer.toString() !== req.user._id.toString() &&
    req.user.userType !== "admin"
  ) {
    throw new ApiError(403, "You don't have permission to view these stats");
  }

  // Get daily views for last 30 days (would need analytics collection for this)
  // For now, return basic stats

  const stats = {
    overview: {
      views: project.views,
      uniqueViews: project.uniqueViews,
      saves: project.saves,
      shares: project.shares,
      proposals: project.proposals,
      shortlisted: project.shortlisted,
      applicantsCount: project.applicantsCount,
      unreadApplications: project.unreadApplications,
    },
    applicants: {
      total: project.applicantsCount,
      pending: project.applicants.filter((a) => a.status === "pending").length,
      shortlisted: project.applicants.filter((a) => a.status === "shortlisted")
        .length,
      hired: project.applicants.filter((a) => a.status === "hired").length,
      rejected: project.applicants.filter((a) => a.status === "rejected")
        .length,
    },
    budget: {
      budget: project.budget,
      hourlyRate: project.hourlyRate,
      estimatedHours: project.estimatedHours,
      averageProposal: project.averageProposal,
    },
    timeline: {
      publishedAt: project.publishedAt,
      deadline: project.deadline,
      timeRemaining: project.timeRemaining,
      completedAt: project.completedAt,
    },
    lastActivity: {
      lastViewAt: project.lastViewAt,
      lastApplicationAt: project.lastApplicationAt,
    },
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Project stats fetched successfully"));
});

// ==================== GET FREELANCER APPLICATIONS ====================

const getFreelancerApplications = asyncHandler(async (req, res) => {
  const {
    status,
    search,
    fromDate,
    page = 1,
    limit = 10,
  } = req.query;

  const freelancerId = req.user._id;

  // Build pipeline to get projects where this freelancer has applied
  const pipeline = [
    {
      $match: {
        "applicants.freelancer": freelancerId,
      },
    },
    {
      $addFields: {
        // Get the specific applicant for this freelancer
        applicant: {
          $arrayElemAt: [
            {
              $filter: {
                input: "$applicants",
                as: "applicant",
                cond: { $eq: ["$$applicant.freelancer", freelancerId] },
              },
            },
            0,
          ],
        },
      },
    },
  ];

  // Filter by applicant status
  if (status && status !== 'all') {
    pipeline.push({
      $match: {
        "applicant.status": status,
      },
    });
  }

  // Filter by date range
  if (fromDate) {
    const fromDateObj = new Date(fromDate);
    pipeline.push({
      $match: {
        "applicant.appliedDate": { $gte: fromDateObj },
      },
    });
  }

  // Search by project title or client name
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { "applicant.name": { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  // Lookup client details
  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "buyer",
        foreignField: "_id",
        as: "client",
      },
    },
    {
      $unwind: {
        path: "$client",
        preserveNullAndEmptyArrays: true,
      },
    }
  );

  // Add fields for easier access
  pipeline.push({
    $addFields: {
      applicationId: "$applicant._id",
      appliedDate: "$applicant.appliedDate",
      proposedBudget: "$applicant.proposedBudget",
      proposedTimeline: "$applicant.proposedTimeline",
      coverLetter: "$applicant.coverLetter",
      applicantSkills: "$applicant.skills",
      applicantAttachments: "$applicant.attachments",
      applicantStatus: "$applicant.status",
      applicantResponse: "$applicant.response",
      unreadMessages: "$applicant.unreadMessages",
      clientName: { $concat: ["$client.firstName", " ", "$client.lastName"] },
      clientAvatar: "$client.profileImage",
      clientRating: "$client.rating",
      clientReviews: "$client.reviewCount",
      clientVerified: "$client.isVerified",
      clientCompany: "$client.company",
    }
  });

  // Get total count for pagination
  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await Project.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Add pagination
  const skip = (Number(page) - 1) * Number(limit);
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: Number(limit) });

  // Project final fields
  pipeline.push({
    $project: {
      _id: 1,
      projectId: "$_id",
      projectTitle: "$title",
      projectBudget: "$budget",
      projectDuration: "$duration",
      projectLocation: "$location",
      projectSkills: "$skills",
      projectCategory: "$category",
      projectSubCategory: "$subCategory",
      projectStatus: "$status",
      applicationId: 1,
      appliedDate: 1,
      proposedBudget: 1,
      proposedTimeline: 1,
      coverLetter: 1,
      applicantSkills: 1,
      applicantAttachments: 1,
      applicantStatus: 1,
      applicantResponse: 1,
      unreadMessages: 1,
      interviewDate: "$applicant.interviewDate",
      interviewLink: "$applicant.interviewLink",
      client: {
        _id: "$client._id",
        name: "$clientName",
        avatar: "$clientAvatar",
        rating: "$clientRating",
        reviews: "$clientReviews",
        verified: "$clientVerified",
        company: "$clientCompany",
        email: "$client.email",
      },
    },
  });

  // Sort by applied date (newest first)
  pipeline.push({
    $sort: { appliedDate: -1 },
  });

  const applications = await Project.aggregate(pipeline);

  // Calculate stats
  const statsPipeline = [
    {
      $match: {
        "applicants.freelancer": freelancerId,
      },
    },
    {
      $unwind: "$applicants",
    },
    {
      $match: {
        "applicants.freelancer": freelancerId,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: {
          $sum: {
            $cond: [{ $eq: ["$applicants.status", "pending"] }, 1, 0],
          },
        },
        shortlisted: {
          $sum: {
            $cond: [{ $eq: ["$applicants.status", "shortlisted"] }, 1, 0],
          },
        },
        hired: {
          $sum: {
            $cond: [{ $eq: ["$applicants.status", "hired"] }, 1, 0],
          },
        },
        rejected: {
          $sum: {
            $cond: [{ $eq: ["$applicants.status", "rejected"] }, 1, 0],
          },
        },
        withdrawn: {
          $sum: {
            $cond: [{ $eq: ["$applicants.status", "withdrawn"] }, 1, 0],
          },
        },
      },
    },
  ];

  const statsResult = await Project.aggregate(statsPipeline);
  const stats = statsResult[0] || {
    total: 0,
    pending: 0,
    shortlisted: 0,
    hired: 0,
    rejected: 0,
    withdrawn: 0,
  };

  // Calculate rates
  const interviewRate = stats.total > 0 
    ? ((stats.shortlisted + stats.hired) / stats.total * 100).toFixed(1) 
    : 0;
  const successRate = stats.total > 0 
    ? (stats.hired / stats.total * 100).toFixed(1) 
    : 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        applications,
        stats: {
          ...stats,
          interviewRate,
          successRate,
        },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "Applications fetched successfully"
    )
  );
});

// ==================== GET SINGLE APPLICATION ====================

const getApplicationById = asyncHandler(async (req, res) => {
  const { projectId, applicantId } = req.params;
  const freelancerId = req.user._id;

  const project = await Project.findById(projectId)
    .populate("buyer", "firstName lastName displayName profileImage email company rating reviewCount isVerified");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Find the specific applicant
  const applicant = project.applicants.id(applicantId);

  if (!applicant) {
    throw new ApiError(404, "Application not found");
  }

  // Verify that this applicant belongs to the freelancer
  if (applicant.freelancer.toString() !== freelancerId.toString()) {
    throw new ApiError(403, "You don't have permission to view this application");
  }

  // Mark as viewed if it was unread
  if (!applicant.viewedByFreelancer) {
    applicant.viewedByFreelancer = true;
    applicant.viewedAt = new Date();
    await project.save();
  }

  // Format response
  const application = {
    _id: applicant._id,
    projectId: project._id,
    projectTitle: project.title,
    projectBudget: project.budget,
    projectDuration: project.duration,
    projectLocation: project.location,
    projectSkills: project.skills,
    projectCategory: project.category,
    projectSubCategory: project.subCategory,
    projectStatus: project.status,
    appliedDate: applicant.appliedDate,
    proposedBudget: applicant.proposedBudget,
    proposedTimeline: applicant.proposedTimeline,
    coverLetter: applicant.coverLetter,
    skills: applicant.skills,
    attachments: applicant.attachments,
    status: applicant.status,
    response: applicant.response,
    unreadMessages: applicant.unreadMessages || 0,
    interviewDate: applicant.interviewDate,
    interviewLink: applicant.interviewLink,
    client: {
      _id: project.buyer._id,
      name: project.buyer.displayName || `${project.buyer.firstName} ${project.buyer.lastName}`,
      avatar: project.buyer.profileImage,
      rating: project.buyer.rating || 0,
      reviews: project.buyer.reviewCount || 0,
      verified: project.buyer.isVerified || false,
      company: project.buyer.company,
      email: project.buyer.email,
    },
  };

  return res.status(200).json(
    new ApiResponse(200, application, "Application fetched successfully")
  );
});

// ==================== WITHDRAW APPLICATION ====================

const withdrawApplication = asyncHandler(async (req, res) => {
  const { projectId, applicantId } = req.params;
  const { reason } = req.body;
  const freelancerId = req.user._id;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Find the specific applicant
  const applicant = project.applicants.id(applicantId);

  if (!applicant) {
    throw new ApiError(404, "Application not found");
  }

  // Verify that this applicant belongs to the freelancer
  if (applicant.freelancer.toString() !== freelancerId.toString()) {
    throw new ApiError(403, "You don't have permission to withdraw this application");
  }

  // Check if application can be withdrawn (only pending or shortlisted)
  if (!['pending', 'shortlisted'].includes(applicant.status)) {
    throw new ApiError(400, `Cannot withdraw application with status: ${applicant.status}`);
  }

  // Update applicant status
  applicant.status = 'withdrawn';
  applicant.withdrawnDate = new Date();
  applicant.withdrawalReason = reason || '';
  applicant.response = {
    type: 'withdrawn',
    message: reason || 'Application withdrawn by freelancer',
    date: new Date(),
  };

  await project.save();

  return res.status(200).json(
    new ApiResponse(200, { applicationId: applicantId }, "Application withdrawn successfully")
  );
});

// ==================== MARK MESSAGES AS READ ====================

const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { projectId, applicantId } = req.params;
  const freelancerId = req.user._id;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Find the specific applicant
  const applicant = project.applicants.id(applicantId);

  if (!applicant) {
    throw new ApiError(404, "Application not found");
  }

  // Verify that this applicant belongs to the freelancer
  if (applicant.freelancer.toString() !== freelancerId.toString()) {
    throw new ApiError(403, "You don't have permission");
  }

  applicant.unreadMessages = 0;
  applicant.lastReadAt = new Date();

  await project.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Messages marked as read")
  );
});

// ==================== UPDATE INTERVIEW RESPONSE ====================

const updateInterviewResponse = asyncHandler(async (req, res) => {
  const { projectId, applicantId } = req.params;
  const { action, message } = req.body; // action: 'accept' or 'decline'
  const freelancerId = req.user._id;

  if (!['accept', 'decline'].includes(action)) {
    throw new ApiError(400, "Invalid action");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Find the specific applicant
  const applicant = project.applicants.id(applicantId);

  if (!applicant) {
    throw new ApiError(404, "Application not found");
  }

  // Verify that this applicant belongs to the freelancer
  if (applicant.freelancer.toString() !== freelancerId.toString()) {
    throw new ApiError(403, "You don't have permission");
  }

  // Check if interview is scheduled
  if (!applicant.interviewDate) {
    throw new ApiError(400, "No interview scheduled for this application");
  }

  applicant.interviewResponse = {
    action,
    message: message || '',
    date: new Date(),
  };

  if (action === 'decline') {
    applicant.interviewDeclined = true;
  }

  await project.save();

  return res.status(200).json(
    new ApiResponse(200, applicant, `Interview ${action}ed successfully`)
  );
});

// ==================== ADMIN: GET ALL PROJECTS ====================

const adminGetAllProjects = asyncHandler(async (req, res) => {
  const {
    status,
    buyer,
    category,
    search,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const query = {};

  if (status) query.status = status;
  if (buyer) query.buyer = buyer;
  if (category) query.category = category;
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const projects = await Project.find(query)
    .populate(
      "buyer",
      "firstName lastName email userType displayName profileImage createdAt",
    )
    .populate("hiredFreelancer", "firstName lastName displayName profileImage")
    .populate("category", "name")
    .populate("subCategory", "name")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await Project.countDocuments(query);

  // Get summary stats
  const stats = await Project.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalBudget: { $sum: "$budget" },
        totalApplicants: { $sum: "$applicantsCount" },
        totalViews: { $sum: "$views" },
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        projects,
        stats,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "All projects fetched successfully",
    ),
  );
});

// ==================== ADMIN: UPDATE PROJECT STATUS ====================

const adminUpdateProjectStatus = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { status, featured, featuredUntil } = req.body;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (status) {
    if (
      ![
        "draft",
        "pending",
        "active",
        "paused",
        "completed",
        "cancelled",
        "expired",
        "suspended",
      ].includes(status)
    ) {
      throw new ApiError(400, "Invalid status");
    }
    project.status = status;
  }

  if (featured !== undefined) {
    project.featured = featured;
    if (featured && featuredUntil) {
      project.featuredUntil = new Date(featuredUntil);
    } else if (!featured) {
      project.featuredUntil = null;
    }
  }

  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project status updated successfully"));
});

// ==================== ADMIN: DELETE PROJECT (hard delete) ====================

const adminDeleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Delete attachments from Cloudinary
  if (project.attachments && project.attachments.length > 0) {
    const publicIds = project.attachments.map((att) => att.publicId);
    try {
      await deleteMultipleFiles(publicIds);
    } catch (error) {
      console.error("Error deleting attachments:", error);
    }
  }

  await project.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project permanently deleted"));
});

// ==================== ADMIN: GET PROJECT FOR EDITING ====================

const adminGetProjectForEdit = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId)
    .populate(
      "buyer",
      "firstName lastName displayName email profileImage createdAt location isVerified",
    )
    .populate(
      "hiredFreelancer",
      "firstName lastName displayName profileImage rating",
    )
    .populate("category", "name")
    .populate("subCategory", "name")
    .populate(
      "applicants.freelancer",
      "firstName lastName displayName profileImage rating email",
    );

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"));
});

// ==================== ADMIN: UPDATE PROJECT ====================

const adminUpdateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const updates = JSON.parse(req.body.data || "{}");

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Validate skills if being updated
  if (updates.skills) {
    try {
      updates.skills = validateSkills(updates.skills);
    } catch (error) {
      throw new ApiError(400, error.message);
    }
  }

  // Handle removed attachments
  if (updates.removedAttachments && updates.removedAttachments.length > 0) {
    // Filter out removed attachments
    const remainingAttachments = project.attachments.filter(
      (att) =>
        !updates.removedAttachments.includes(att._id?.toString()) &&
        !updates.removedAttachments.includes(att.publicId),
    );

    project.attachments = remainingAttachments;

    // Delete from Cloudinary (optional)
    try {
      await deleteMultipleFiles(updates.removedAttachments);
    } catch (error) {
      console.error("Error deleting attachments:", error);
    }
  }

  // Handle new attachments
  if (req.files && req.files.length > 0) {
    const currentTotal = project.attachments.length;
    if (currentTotal + req.files.length > 5) {
      throw new ApiError(400, "Maximum 5 files allowed");
    }

    const newAttachments = [...project.attachments];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      if (file.size > 10 * 1024 * 1024) {
        throw new ApiError(400, `File ${file.originalname} exceeds 10MB limit`);
      }

      try {
        const result = await uploadFile(
          file.buffer,
          `projects/${project.slug}/attachments/${Date.now()}-${file.originalname}`,
        );
        newAttachments.push({
          name: file.originalname,
          url: result.secure_url,
          publicId: result.public_id,
          type: file.mimetype,
          size: file.size,
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        throw new ApiError(500, "Failed to upload attachments");
      }
    }

    updates.attachments = newAttachments;
  }

  // Update title and regenerate slug if title changed
  if (updates.title && updates.title !== project.title) {
    updates.slug = generateSlug(updates.title);

    // Check if new slug is unique
    const existingProject = await Project.findOne({
      slug: updates.slug,
      _id: { $ne: projectId },
    });
    if (existingProject) {
      throw new ApiError(400, "A project with this title already exists");
    }
  }

  // Remove temporary fields from updates
  delete updates.removedAttachments;
  delete updates.moderationNotes;

  // Update project
  Object.assign(project, updates);
  await project.save();

  await project.populate(
    "buyer",
    "firstName lastName displayName profileImage",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});

export {
  createProject,
  getProjects,
  getProjectBySlug,
  getProjectById,
  getBuyerProjects,
  updateProject,
  deleteProject,
  toggleProjectStatus,
  getProjectApplicants,
  updateApplicantStatus,
  markApplicantViewed,
  applyToProject,
  completeProject,
  duplicateProject,
  incrementViews,
  incrementSaves,
  decrementSaves,
  incrementShares,
  searchProjects,
  getProjectStats,
  adminGetAllProjects,
  adminUpdateProjectStatus,
  adminDeleteProject,
  adminGetProjectForEdit,
  adminUpdateProject,
  getFreelancerApplications,
  getApplicationById,
  withdrawApplication,
  markMessagesAsRead,
  updateInterviewResponse,
};

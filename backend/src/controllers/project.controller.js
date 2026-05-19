import Project from "../models/project.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

// ==================== CREATE PROJECT ====================

const createProject = asyncHandler(async (req, res) => {
    const {
        title,
        category,
        subCategory,
        description,
        period,
        duration,
        service,
        skills,
    } = req.body;

    // Validation
    if (!title || !category || !description || !period || !duration || !service) {
        throw new ApiError(400, "All required fields must be filled");
    }

    if (title.length < 10) {
        throw new ApiError(400, "Title must be at least 10 characters");
    }

    if (title.length > 150) {
        throw new ApiError(400, "Title cannot exceed 150 characters");
    }

    // Validate skills
    const validatedSkills = validateSkills(skills);

    // Validate period and duration combination
    if (period === "one_time" && duration !== "standard") {
        throw new ApiError(400, "One-time period only supports standard duration");
    }

    // Generate unique slug
    const slug = generateSlug(title);
    const existingProject = await Project.findOne({ slug });
    if (existingProject) {
        throw new ApiError(400, "A project with this title already exists");
    }

    // Create project
    const project = await Project.create({
        title,
        slug,
        description,
        category,
        subCategory: subCategory || null,
        period,
        duration,
        service,
        skills: validatedSkills,
        buyer: req.user._id,
        status: "active",
    });

    // Populate buyer info
    await project.populate("buyer", "firstName lastName displayName profileImage");
    await project.populate("category", "name");
    await project.populate("subCategory", "name");

    return res.status(201).json(
        new ApiResponse(201, project, "Project created successfully")
    );
});

// ==================== GET ALL ACTIVE PROJECTS ====================

const getProjects = asyncHandler(async (req, res) => {
    const {
        category,
        subCategory,
        service,
        period,
        skills,
        search,
        page = 1,
        limit = 10,
    } = req.query;

    const filters = {
        category,
        subCategory,
        service,
        period,
        skills: skills ? skills.split(",") : undefined,
        search,
    };

    const { projects, total, pages } = await Project.getActiveProjects(
        filters,
        parseInt(page),
        parseInt(limit)
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                projects,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages,
                },
            },
            "Projects fetched successfully"
        )
    );
});

// ==================== GET PROJECT BY ID ====================

const getProjectById = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
        .populate("buyer", "firstName lastName displayName profileImage email rating reviewCount country createdAt")
        .populate("category", "name")
        .populate("subCategory", "name")
        .populate("hiredFreelancer", "firstName lastName displayName profileImage rating reviewCount");

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Increment view count if not the owner
    if (!req.user || req.user._id.toString() !== project.buyer._id.toString()) {
        await project.incrementViews();
    }

    return res.status(200).json(
        new ApiResponse(200, project, "Project fetched successfully")
    );
});

// ==================== GET PROJECT BY SLUG ====================

const getProjectBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const project = await Project.findOne({ slug })
        .populate("buyer", "firstName lastName displayName profileImage email rating")
        .populate("category", "name")
        .populate("subCategory", "name")
        .populate("hiredFreelancer", "firstName lastName displayName profileImage rating");

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Increment view count if not the owner
    if (!req.user || req.user._id.toString() !== project.buyer._id.toString()) {
        await project.incrementViews();
    }

    return res.status(200).json(
        new ApiResponse(200, project, "Project fetched successfully")
    );
});

// ==================== GET BUYER'S PROJECTS ====================

const getBuyerProjects = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const buyerId = req.user._id;

    const projects = await Project.getBuyerProjects(buyerId, status);

    // Get stats
    const stats = {
        total: projects.length,
        active: projects.filter(p => p.status === "active").length,
        filled: projects.filter(p => p.status === "filled").length,
        completed: projects.filter(p => p.status === "completed").length,
        cancelled: projects.filter(p => p.status === "cancelled").length,
        draft: projects.filter(p => p.status === "draft").length,
        totalProposals: projects.reduce((sum, p) => sum + (p.proposalsCount || 0), 0),
        totalViews: projects.reduce((sum, p) => sum + (p.views || 0), 0),
    };

    return res.status(200).json(
        new ApiResponse(
            200,
            { projects, stats },
            "Your projects fetched successfully"
        )
    );
});

// ==================== UPDATE PROJECT ====================

const updateProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const updates = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check ownership
    if (project.buyer.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to update this project");
    }

    // Check if project is already filled/hired
    if (project.status === "filled") {
        throw new ApiError(400, "Cannot update a project that already has a hired freelancer");
    }

    // Validate updates
    const allowedUpdates = [
        "title", "category", "subCategory", "description",
        "period", "duration", "service", "skills"
    ];

    const updateData = {};
    for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
            updateData[key] = updates[key];
        }
    }

    // Validate skills if being updated
    if (updateData.skills) {
        updateData.skills = validateSkills(updateData.skills);
    }

    // Validate period/duration combination
    if (updateData.period === "one_time" && updateData.duration !== "standard") {
        throw new ApiError(400, "One-time period only supports standard duration");
    }

    // Update title and regenerate slug if changed
    if (updateData.title && updateData.title !== project.title) {
        updateData.slug = generateSlug(updateData.title);
        const existingProject = await Project.findOne({
            slug: updateData.slug,
            _id: { $ne: projectId },
        });
        if (existingProject) {
            throw new ApiError(400, "A project with this title already exists");
        }
    }

    // Apply updates
    Object.assign(project, updateData);
    await project.save();

    await project.populate("category", "name");
    await project.populate("subCategory", "name");

    return res.status(200).json(
        new ApiResponse(200, project, "Project updated successfully")
    );
});

// ==================== DELETE PROJECT ====================

const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check ownership
    if (project.buyer.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to delete this project");
    }

    // Check if project has proposals
    // if (project.proposalsCount > 0) {
    //     throw new ApiError(400, "Cannot delete a project that has proposals");
    // }

    await project.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, {}, "Project deleted successfully")
    );
});

// ==================== APPLY TO PROJECT (Freelancer) ====================

const applyToProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { proposal, period, duration, service } = req.body;

    if (!proposal || proposal.trim().length < 20) {
        throw new ApiError(400, "Please provide a detailed proposal (minimum 20 characters)");
    }

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check if project is still active
    if (project.status !== "active") {
        throw new ApiError(400, "This project is no longer accepting applications");
    }

    // Get freelancer details
    const freelancer = await User.findById(req.user._id);

    if (!freelancer || freelancer.userType !== "freelancer") {
        throw new ApiError(403, "Only freelancers/mentors can apply to projects");
    }

    // Check if already applied
    if (project.hasApplied(req.user._id)) {
        throw new ApiError(400, "You have already submitted a proposal for this project");
    }

    const freelancerName = freelancer.displayName ||
        `${freelancer.firstName || ""} ${freelancer.lastName || ""}`.trim() ||
        "Freelancer";

    // Add proposal with selected options (use provided values or fallback to project defaults)
    await project.addProposal(
        freelancer._id,
        freelancerName,
        freelancer.profileImage,
        proposal,
        period || project.period,
        duration || project.duration,
        service || project.service
    );

    return res.status(200).json(
        new ApiResponse(200, { projectId }, "Interest expressed successfully")
    );
});

// ==================== GET PROJECT PROPOSALS (Buyer) ====================

const getProjectProposals = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check ownership
    if (project.buyer.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to view proposals");
    }

    // Populate freelancer details for proposals
    await project.populate("proposals.freelancer", "firstName lastName displayName profileImage rating reviewCount");

    return res.status(200).json(
        new ApiResponse(200, {
            proposals: project.proposals,
            stats: {
                total: project.proposalsCount,
                pending: project.proposals.filter(p => p.status === "pending").length,
                accepted: project.proposals.filter(p => p.status === "accepted").length,
                rejected: project.proposals.filter(p => p.status === "rejected").length,
            },
        }, "Proposals fetched successfully")
    );
});

// ==================== UPDATE PROPOSAL STATUS (Buyer) ====================

const updateProposalStatus = asyncHandler(async (req, res) => {
    const { projectId, proposalId } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
        throw new ApiError(400, "Invalid status. Must be 'accepted' or 'rejected'");
    }

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check ownership
    if (project.buyer.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to update proposal status");
    }

    // Check if project is still active
    if (project.status !== "active" && status === "accepted") {
        throw new ApiError(400, "This project is no longer active");
    }

    const proposal = project.proposals.id(proposalId);
    if (!proposal) {
        throw new ApiError(404, "Proposal not found");
    }

    proposal.status = status;
    proposal.updatedAt = new Date();

    // If accepting, mark project as filled
    if (status === "accepted") {
        project.status = "filled";
        project.hiredFreelancer = proposal.freelancer;
        project.hiredAt = new Date();
    }

    await project.save();

    return res.status(200).json(
        new ApiResponse(200, proposal, `Proposal ${status} successfully`)
    );
});

// ==================== GET FREELANCER'S APPLICATIONS ====================

const getFreelancerApplications = asyncHandler(async (req, res) => {
    const freelancerId = req.user._id;

    const projects = await Project.find({
        "proposals.freelancer": freelancerId,
    })
        .populate("buyer", "firstName lastName displayName profileImage email company rating reviewCount isVerified")
        .populate("category", "name")
        .populate("subCategory", "name")
        .sort({ createdAt: -1 });

    // Format applications with all proposal details
    const applications = projects.map(project => {
        const proposal = project.proposals.find(
            p => p.freelancer.toString() === freelancerId.toString()
        );

        return {
            applicationId: proposal?._id,
            projectId: project._id,
            projectTitle: project.title,
            projectDescription: project.description,
            projectStatus: project.status,
            projectCategory: project.category?.name || project.category,
            projectSubCategory: project.subCategory?.name || project.subCategory,
            projectSkills: project.skills || [],
            projectService: project.service,
            projectPeriod: project.period,
            projectDuration: project.duration,
            // Freelancer's selected options from the proposal
            selectedPeriod: proposal?.selectedPeriod || project.period,
            selectedDuration: proposal?.selectedDuration || project.duration,
            selectedService: proposal?.selectedService || project.service,
            proposal: proposal?.proposal,
            proposalStatus: proposal?.status,
            appliedAt: proposal?.createdAt,
            updatedAt: proposal?.updatedAt,
            response: proposal?.response || null,
            client: project.buyer ? {
                _id: project.buyer._id,
                name: project.buyer.displayName || `${project.buyer.firstName || ''} ${project.buyer.lastName || ''}`.trim(),
                avatar: project.buyer.profileImage,
                rating: project.buyer.rating,
                reviews: project.buyer.reviewCount,
                verified: project.buyer.isVerified,
                email: project.buyer.email
            } : null
        };
    });

    const stats = {
        total: applications.length,
        pending: applications.filter(a => a.proposalStatus === "pending").length,
        accepted: applications.filter(a => a.proposalStatus === "accepted").length,
        rejected: applications.filter(a => a.proposalStatus === "rejected").length,
        withdrawn: applications.filter(a => a.proposalStatus === "withdrawn").length,
    };

    return res.status(200).json(
        new ApiResponse(200, { applications, stats }, "Applications fetched successfully")
    );
});

// ==================== GET SINGLE APPLICATION DETAIL ====================

const getApplicationById = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const freelancerId = req.user._id;

    const project = await Project.findById(projectId)
        .populate("buyer", "firstName lastName displayName profileImage email company rating reviewCount isVerified")
        .populate("category", "name")
        .populate("subCategory", "name");

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const proposal = project.proposals.find(
        p => p.freelancer.toString() === freelancerId.toString()
    );

    if (!proposal) {
        throw new ApiError(404, "Application not found");
    }

    // Mark as viewed if not already
    if (!proposal.viewedByFreelancer) {
        proposal.viewedByFreelancer = true;
        proposal.viewedAt = new Date();
        await project.save();
    }

    const application = {
        applicationId: proposal._id,
        projectId: project._id,
        projectTitle: project.title,
        projectDescription: project.description,
        projectStatus: project.status,
        projectCategory: project.category?.name || project.category,
        projectSubCategory: project.subCategory?.name || project.subCategory,
        projectSkills: project.skills || [],
        projectService: project.service,
        projectPeriod: project.period,
        projectDuration: project.duration,
        // Freelancer's selected options
        selectedPeriod: proposal.selectedPeriod || project.period,
        selectedDuration: proposal.selectedDuration || project.duration,
        selectedService: proposal.selectedService || project.service,
        proposal: proposal.proposal,
        proposalStatus: proposal.status,
        appliedAt: proposal.createdAt,
        updatedAt: proposal.updatedAt,
        response: proposal.response || null,
        client: {
            _id: project.buyer._id,
            name: project.buyer.displayName || `${project.buyer.firstName || ''} ${project.buyer.lastName || ''}`.trim(),
            avatar: project.buyer.profileImage,
            rating: project.buyer.rating || 0,
            reviews: project.buyer.reviewCount || 0,
            verified: project.buyer.isVerified || false,
            email: project.buyer.email,
            company: project.buyer.company
        }
    };

    return res.status(200).json(
        new ApiResponse(200, application, "Application fetched successfully")
    );
});

// ==================== WITHDRAW APPLICATION ====================

const withdrawApplication = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const freelancerId = req.user._id;

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const proposalIndex = project.proposals.findIndex(
        p => p.freelancer.toString() === freelancerId.toString()
    );

    if (proposalIndex === -1) {
        throw new ApiError(404, "Application not found");
    }

    const proposal = project.proposals[proposalIndex];

    if (proposal.status !== "pending") {
        throw new ApiError(400, `Cannot withdraw ${proposal.status} application`);
    }

    // Remove the proposal
    project.proposals.splice(proposalIndex, 1);
    project.proposalsCount = project.proposals.length;
    await project.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Application withdrawn successfully")
    );
});

// ==================== MARK PROJECT AS COMPLETED ====================

const completeProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // Check ownership
    if (project.buyer.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You don't have permission to complete this project");
    }

    // if (project.status !== "filled") {
    //     throw new ApiError(400, "Only projects with hired freelancers can be marked as completed");
    // }

    project.status = "completed";
    await project.save();

    return res.status(200).json(
        new ApiResponse(200, project, "Project marked as completed")
    );
});

// ==================== SEARCH PROJECTS ====================

const searchProjects = asyncHandler(async (req, res) => {
    const { q, category, service, period, skills, page = 1, limit = 10 } = req.query;

    const query = { status: "active" };

    if (q) {
        query.$text = { $search: q };
    }

    if (category) {
        query.category = category;
    }

    if (service) {
        query.service = service;
    }

    if (period) {
        query.period = period;
    }

    if (skills) {
        const skillsArray = skills.split(",");
        query.skills = { $in: skillsArray };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [projects, total] = await Promise.all([
        Project.find(query)
            .populate("buyer", "firstName lastName displayName profileImage")
            .populate("category", "name")
            .populate("subCategory", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Project.countDocuments(query),
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                projects,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
            "Search results fetched successfully"
        )
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
    .populate("buyer", "firstName lastName email userType displayName profileImage createdAt isVerified rating reviewCount")
    .populate("category", "name")
    .populate("subCategory", "name")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  const total = await Project.countDocuments(query);

  // Get summary stats by status
  const stats = await Project.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalProposals: { $sum: "$proposalsCount" },
        totalViews: { $sum: "$views" }
      }
    }
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
  const { status, featured, featuredUntil, cancellationReason } = req.body;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (status) {
    const validStatuses = [
      "draft", "pending", "active", "paused", "completed", 
      "cancelled", "expired", "suspended", "rejected", "filled"
    ];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, "Invalid status");
    }
    project.status = status;
    
    // If rejecting, store reason
    if (status === 'rejected' && cancellationReason) {
      project.cancellationReason = cancellationReason;
    }
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

  // Delete attachments from Cloudinary if any
  if (project.attachments && project.attachments.length > 0) {
    const publicIds = project.attachments.map((att) => att.publicId).filter(Boolean);
    if (publicIds.length > 0) {
      try {
        await deleteMultipleFiles(publicIds);
      } catch (error) {
        console.error("Error deleting attachments:", error);
      }
    }
  }

  await project.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project permanently deleted"));
});

// ==================== ADMIN: GET PROJECT FOR EDITING ====================

const adminGetProjectForEdit = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId)
    .populate("buyer", "firstName lastName displayName email profileImage createdAt location isVerified rating reviewCount")
    .populate("category", "name")
    .populate("subCategory", "name")
    .populate("proposals.freelancer", "firstName lastName displayName profileImage rating email");

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
    if (!updates.skills || updates.skills.length === 0) {
      throw new ApiError(400, "At least one skill is required");
    }
    if (updates.skills.length > 10) {
      throw new ApiError(400, "Maximum 10 skills allowed");
    }
  }

  // Handle removed attachments
  if (updates.removedAttachments && updates.removedAttachments.length > 0) {
    const remainingAttachments = project.attachments.filter(
      (att) =>
        !updates.removedAttachments.includes(att._id?.toString()) &&
        !updates.removedAttachments.includes(att.publicId)
    );
    project.attachments = remainingAttachments;

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
    const generateSlug = (title) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    };
    updates.slug = generateSlug(updates.title);

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

  await project.populate("buyer", "firstName lastName displayName profileImage rating email reviewCount");

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});

// ==================== ADMIN: GET PROJECT PROPOSALS ====================

const adminGetProjectProposals = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId)
    .populate("proposals.freelancer", "firstName lastName displayName profileImage rating reviewCount title");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const stats = {
    total: project.proposals.length,
    pending: project.proposals.filter(p => p.status === "pending").length,
    accepted: project.proposals.filter(p => p.status === "accepted").length,
    rejected: project.proposals.filter(p => p.status === "rejected").length,
  };

  return res.status(200).json(
    new ApiResponse(200, {
      proposals: project.proposals,
      stats
    }, "Proposals fetched successfully")
  );
});

export {
    createProject,
    getProjects,
    getProjectById,
    getProjectBySlug,
    getBuyerProjects,
    updateProject,
    deleteProject,
    applyToProject,
    getProjectProposals,
    updateProposalStatus,
    getFreelancerApplications,
    getApplicationById,
    withdrawApplication,
    completeProject,
    searchProjects,
    adminGetAllProjects,
    adminUpdateProjectStatus,
    adminDeleteProject,
    adminGetProjectForEdit,
    adminUpdateProject,
    adminGetProjectProposals,
};
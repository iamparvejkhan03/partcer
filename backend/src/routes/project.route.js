import { Router } from "express";
import {
    auth,
    authFreelancer,
    authBuyer,
    optionalAuth,
    authAdmin,
} from "../middlewares/auth.middleware.js";
import {
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
    adminGetProjectForEdit,
    adminGetProjectProposals,
    adminUpdateProject,
    adminUpdateProjectStatus,
    adminDeleteProject,
} from "../controllers/project.controller.js";

import upload from "../middlewares/multer.middleware.js"

const projectRouter = Router();

// ==================== PUBLIC ROUTES ====================

// Search and listing
projectRouter.get("/search", searchProjects);
projectRouter.get("/", getProjects);
projectRouter.get("/:projectId", optionalAuth, getProjectById);
projectRouter.get("/slug/:slug", optionalAuth, getProjectBySlug);

// ==================== PROTECTED ROUTES ====================

// Buyer routes
projectRouter.post("/", authBuyer, createProject);
projectRouter.get("/buyer/me", authBuyer, getBuyerProjects);
projectRouter.put("/:projectId", authBuyer, updateProject);
projectRouter.delete("/:projectId", authBuyer, deleteProject);
projectRouter.post("/:projectId/complete", authBuyer, completeProject);

// Buyer - Proposal management (UPDATED from applicants to proposals)
projectRouter.get("/:projectId/proposals", authBuyer, getProjectProposals);
projectRouter.patch("/:projectId/proposals/:proposalId", authBuyer, updateProposalStatus);

// Freelancer routes (UPDATED)
projectRouter.get("/applications/me", authFreelancer, getFreelancerApplications);
projectRouter.get("/:projectId/application", authFreelancer, getApplicationById);
projectRouter.post("/:projectId/apply", authFreelancer, applyToProject); // This now accepts period/duration/service
projectRouter.delete("/:projectId/application", authFreelancer, withdrawApplication);

// ==================== ADMIN ROUTES ====================

// Get all projects (with pagination and filters)
projectRouter.get("/admin/all", authAdmin, adminGetAllProjects);

// Get project for editing
projectRouter.get("/admin/:projectId/edit", authAdmin, adminGetProjectForEdit);

// Get project proposals
projectRouter.get("/admin/:projectId/proposals", authAdmin, adminGetProjectProposals);

// Update project (admin)
projectRouter.put(
  "/admin/:projectId",
  authAdmin,
  upload.array("projectAttachments", 5),
  adminUpdateProject
);

// Update project status (admin)
projectRouter.patch("/admin/:projectId/status", authAdmin, adminUpdateProjectStatus);

// Delete project (admin - hard delete)
projectRouter.delete("/admin/:projectId", authAdmin, adminDeleteProject);

export default projectRouter;
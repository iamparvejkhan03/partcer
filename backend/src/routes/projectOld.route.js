import { Router } from "express";
import {
  auth,
  authFreelancer,
  authBuyer,
  authAdmin,
  optionalAuth,
} from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import {
  createProject,
  getProjects,
  getProjectBySlug,
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
  getProjectById,
  getFreelancerApplications,
  getApplicationById,
  withdrawApplication,
  markMessagesAsRead,
  updateInterviewResponse,
} from "../controllers/project.controller.js";

const projectRouter = Router();

// ==================== PUBLIC ROUTES ====================

// Search and listing
projectRouter.get("/search", searchProjects);
projectRouter.get("/", getProjects);
// projectRouter.get("/:slug", optionalAuth, getProjectBySlug);
projectRouter.get("/:projectId", optionalAuth, getProjectById);

// Interactions (public but rate-limited ideally)
projectRouter.post("/:projectId/views", incrementViews);
projectRouter.post("/:projectId/shares", incrementShares);

// ==================== PROTECTED ROUTES (require login) ====================

// Project management (Buyers only)
projectRouter.post(
  "/",
  authBuyer,
  upload.array("projectAttachments", 5),
  createProject,
);
projectRouter.get("/buyer/me", authBuyer, getBuyerProjects);
projectRouter.get("/buyer/:projectId/stats", authBuyer, getProjectStats);
projectRouter.put(
  "/:projectId",
  authBuyer,
  upload.array("projectAttachments", 5),
  updateProject,
);
projectRouter.patch("/:projectId/status", authBuyer, toggleProjectStatus);
projectRouter.delete("/:projectId", authBuyer, deleteProject);
projectRouter.post("/:projectId/duplicate", authBuyer, duplicateProject);

// Project completion
projectRouter.post("/:projectId/complete", authBuyer, completeProject);

// Applicant management (Buyers only)
projectRouter.get("/:projectId/applicants", authBuyer, getProjectApplicants);
projectRouter.patch(
  "/:projectId/applicants/:applicantId",
  authBuyer,
  updateApplicantStatus,
);
projectRouter.patch(
  "/:projectId/applicants/:applicantId/view",
  authBuyer,
  markApplicantViewed,
);

// Apply to projects (Freelancers only)
projectRouter.post(
  "/:projectId/apply",
  authFreelancer,
  upload.array("projectAttachments", 5),
  applyToProject,
);

// Wishlist/Saves (Freelancers can save projects)
projectRouter.post("/:projectId/save", authFreelancer, incrementSaves);
projectRouter.delete("/:projectId/save", authFreelancer, decrementSaves);

// ==================== FREELANCER APPLICATION ROUTES ====================

// Get all applications for the logged-in freelancer
projectRouter.get(
  "/applications/me",
  authFreelancer,
  getFreelancerApplications,
);

// Get single application details
projectRouter.get(
  "/:projectId/applications/:applicantId",
  authFreelancer,
  getApplicationById,
);

// Withdraw application
projectRouter.patch(
  "/:projectId/applications/:applicantId/withdraw",
  authFreelancer,
  withdrawApplication,
);

// Mark messages as read
projectRouter.patch(
  "/:projectId/applications/:applicantId/read",
  authFreelancer,
  markMessagesAsRead,
);

// Accept/decline interview
projectRouter.patch(
  "/:projectId/applications/:applicantId/interview",
  authFreelancer,
  updateInterviewResponse,
);

// ==================== ADMIN ROUTES ====================

projectRouter.get("/admin/all", authAdmin, adminGetAllProjects);
projectRouter.put(
  "/admin/:projectId",
  authAdmin,
  upload.array("projectAttachments", 5),
  adminUpdateProject,
);
projectRouter.get("/admin/:projectId/edit", authAdmin, adminGetProjectForEdit);
projectRouter.patch(
  "/admin/:projectId/status",
  authAdmin,
  adminUpdateProjectStatus,
);
projectRouter.delete("/admin/:projectId", authAdmin, adminDeleteProject);
projectRouter.get(
  "/admin/:projectId/applicants",
  authAdmin,
  getProjectApplicants,
);

export default projectRouter;

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
  createService,
  getServices,
  getServiceBySlug,
  getSellerServices,
  updateService,
  deleteService,
  toggleServiceStatus,
  updateGallery,
  addReview,
  incrementViews,
  incrementSaves,
  decrementSaves,
  incrementShares,
  searchServices,
  getServiceStats,
  adminGetAllServices,
  adminUpdateServiceStatus,
  adminDeleteService,
  adminGetServiceForEdit,
  adminUpdateService,
  getServiceById,
} from "../controllers/service.controller.js";

const serviceRouter = Router();

// ==================== PUBLIC ROUTES ====================

// Search and listing
serviceRouter.get("/search", searchServices);
serviceRouter.get("/", getServices);
serviceRouter.get("/:serviceId", optionalAuth, getServiceById);
// serviceRouter.get("/:slug", optionalAuth, getServiceBySlug);

// Interactions (public but rate-limited ideally)
serviceRouter.post("/:serviceId/views", incrementViews);
serviceRouter.post("/:serviceId/shares", incrementShares);

// ==================== PROTECTED ROUTES (require login) ====================

// Service management (Freelancers only)
serviceRouter.post(
  "/",
  authFreelancer,
  upload.array("gallery", 10),
  createService,
);
serviceRouter.get("/seller/me", authFreelancer, getSellerServices);
serviceRouter.get("/seller/:serviceId/stats", authFreelancer, getServiceStats);
serviceRouter.put(
  "/:serviceId",
  authFreelancer,
  upload.array("gallery", 10),
  updateService,
);
serviceRouter.patch("/:serviceId/status", authFreelancer, toggleServiceStatus);
serviceRouter.patch("/:serviceId/gallery", authFreelancer, updateGallery);
serviceRouter.delete("/:serviceId", authFreelancer, deleteService);

// Wishlist/Saves (Buyers can save services)
serviceRouter.post("/:serviceId/save", authBuyer, incrementSaves);
serviceRouter.delete("/:serviceId/save", authBuyer, decrementSaves);

// Reviews (Buyers who purchased can review)
serviceRouter.post("/:serviceId/reviews", authBuyer, addReview);

// ==================== ADMIN ROUTES ====================

serviceRouter.get("/admin/all", authAdmin, adminGetAllServices);
serviceRouter.put(
  "/admin/:serviceId",
  authAdmin,
  upload.array("gallery", 10),
  adminUpdateService
);
serviceRouter.get("/admin/:serviceId/edit", authAdmin, adminGetServiceForEdit);
serviceRouter.patch(
  "/admin/:serviceId/status",
  authAdmin,
  adminUpdateServiceStatus,
);
serviceRouter.delete("/admin/:serviceId", authAdmin, adminDeleteService);

export default serviceRouter;
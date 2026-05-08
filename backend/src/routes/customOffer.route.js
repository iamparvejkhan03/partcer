import { Router } from "express";
import {
  auth,
  authFreelancer,
  authBuyer,
  authAdmin,
} from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import {
  createCustomOffer,
  getCustomOffers,
  getCustomOfferById,
  updateCustomOffer,
  sendCustomOffer,
  respondToOffer,
  getBuyerOffers,
  getSellerOffers,
  markAsViewed,
  deleteCustomOffer,
  adminGetAllOffers,
  adminDeleteOffer,
} from "../controllers/customOffer.controller.js";

const customOfferRouter = Router();

// ==================== PROTECTED ROUTES ====================

// Create custom offer (Freelancers only)
customOfferRouter.post(
  "/",
  authFreelancer,
  upload.array("attachments", 5),
  createCustomOffer
);

// Get user's custom offers (both buyer and seller)
customOfferRouter.get("/", auth, getCustomOffers);

// Get buyer's offers
customOfferRouter.get("/buyer/me", authBuyer, getBuyerOffers);

// Get seller's offers
customOfferRouter.get("/seller/me", authFreelancer, getSellerOffers);

// Get custom offer by ID
customOfferRouter.get("/:offerId", auth, getCustomOfferById);

// Update custom offer (seller only, while in draft)
customOfferRouter.put(
  "/:offerId",
  authFreelancer,
  upload.array("attachments", 5),
  updateCustomOffer
);

// Send custom offer (move from draft to sent)
customOfferRouter.patch("/:offerId/send", authFreelancer, sendCustomOffer);

// Mark offer as viewed (buyer only)
customOfferRouter.patch("/:offerId/view", authBuyer, markAsViewed);

// Respond to offer (accept/decline)
customOfferRouter.patch("/:offerId/respond", authBuyer, respondToOffer);

// Delete custom offer (seller only, while in draft)
customOfferRouter.delete("/:offerId", authFreelancer, deleteCustomOffer);

// ==================== ADMIN ROUTES ====================

// Get all offers (admin)
customOfferRouter.get("/admin/all", authAdmin, adminGetAllOffers);

// Delete offer (admin)
customOfferRouter.delete("/admin/:offerId", authAdmin, adminDeleteOffer);

export default customOfferRouter;
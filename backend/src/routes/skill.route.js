import express from "express";
import {
  createSkill,
  getAllSkills,
  getSkillById,
  updateSkill,
  deleteSkill,
  toggleSkillStatus,
  getSkillsByCategory,
  bulkCreateSkills,
  // Public controllers
  getPublicSkills,
  getPublicSkillBySlug,
} from "../controllers/skill.controller.js";
import { auth, authAdmin } from "../middlewares/auth.middleware.js";

const skillRouter = express.Router();

// =============================================
// PUBLIC ROUTES (No authentication)
// =============================================
skillRouter.get("/public", getPublicSkills);
skillRouter.get("/public/by-slug/:slug", getPublicSkillBySlug);
skillRouter.get("/public/by-category/:categoryId", getSkillsByCategory);

// =============================================
// ADMIN ROUTES (Authentication required)
// =============================================
skillRouter.post("/", createSkill);
skillRouter.use(auth, authAdmin);

// Skill CRUD
skillRouter.post("/bulk", bulkCreateSkills);
skillRouter.get("/", getAllSkills);
skillRouter.get("/by-category/:categoryId", getSkillsByCategory);
skillRouter.get("/:id", getSkillById);
skillRouter.put("/:id", updateSkill);
skillRouter.delete("/:id", deleteSkill);
skillRouter.patch("/:id/toggle-status", toggleSkillStatus);

export default skillRouter;

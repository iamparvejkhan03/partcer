import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getOrderSessions,
    submitSession,
    resubmitSession,
    approveSession,
    rejectSession,
    getSessionStatus,
} from "../controllers/session.controller.js";

const sessionRouter = Router();

// Get all sessions for an order
sessionRouter.get("/orders/:orderId/sessions", verifyJWT, getOrderSessions);

// Get session status for an order
sessionRouter.get("/orders/:orderId/sessions/status", verifyJWT, getSessionStatus);

// Submit a session (mentor)
sessionRouter.post("/orders/:orderId/sessions/submit", verifyJWT, submitSession);

// Resubmit a rejected session (mentor)
sessionRouter.put("/sessions/:sessionId/resubmit", verifyJWT, resubmitSession);

// Approve a session (student)
sessionRouter.put("/sessions/:sessionId/approve", verifyJWT, approveSession);

// Reject a session (student)
sessionRouter.put("/sessions/:sessionId/reject", verifyJWT, rejectSession);

export default sessionRouter;
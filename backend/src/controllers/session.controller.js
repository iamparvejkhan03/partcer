import Session from "../models/session.model.js";
import NewOrder from "../models/newOrder.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Helper: Calculate total sessions based on period
const calculateTotalSessions = (period) => {
    const sessionMap = {
        "One-time": 1,
        "Per day": 1,
        "Weekly": 5,
        "Monthly": 21,
    };
    return sessionMap[period] || 0;
};

// Helper: Get the next pending session number
const getNextSessionNumber = async (orderId) => {
    const sessions = await Session.find({ orderId }).sort({ sessionNumber: 1 });
    if (sessions.length === 0) return 1;

    // Find the first missing number in sequence
    let expectedNumber = 1;
    for (const session of sessions) {
        if (session.sessionNumber !== expectedNumber) {
            return expectedNumber;
        }
        expectedNumber++;
    }
    return expectedNumber;
};

// ==================== CREATE SESSIONS ON ORDER CREATION ====================
export const initializeOrderSessions = async (orderId, period, mentorId, studentId) => {
    try {
        const totalSessions = calculateTotalSessions(period);

        // Update order with total sessions
        await NewOrder.findByIdAndUpdate(orderId, { totalSessions });

        // Create all sessions with 'pending' status
        const sessions = [];
        for (let i = 1; i <= totalSessions; i++) {
            sessions.push({
                orderId,
                sessionNumber: i,
                title: `Session ${i}`,
                status: "pending",
                mentorId,
                studentId,
            });
        }

        if (sessions.length > 0) {
            await Session.insertMany(sessions);
        }

        return { totalSessions, sessionsCount: sessions.length };
    } catch (error) {
        console.error("Error initializing sessions:", error);
        throw error;
    }
};

// ==================== GET ALL SESSIONS FOR AN ORDER ====================
export const getOrderSessions = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    // Check if order exists and user has access
    const order = await NewOrder.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Check if user is mentor or student or admin
    const isMentor = order.mentorId.toString() === req.user._id.toString();
    const isStudent = order.studentId.toString() === req.user._id.toString();
    const isAdmin = req.user.userType === "admin";

    if (!isMentor && !isStudent && !isAdmin) {
        throw new ApiError(403, "You don't have permission to view these sessions");
    }

    const sessions = await Session.find({ orderId })
        .populate("submittedBy", "firstName lastName agencyName profileImage")
        .sort({ sessionNumber: 1 });

    // Get session stats
    const stats = {
        total: sessions.length,
        pending: sessions.filter(s => s.status === "pending").length,
        submitted: sessions.filter(s => s.status === "submitted").length,
        approved: sessions.filter(s => s.status === "approved").length,
        rejected: sessions.filter(s => s.status === "rejected").length,
    };

    return res.status(200).json(
        new ApiResponse(200, { sessions, stats }, "Sessions fetched successfully")
    );
});

// ==================== SUBMIT SESSION (MENTOR) ====================
export const submitSession = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { description } = req.body;

    if (!description || description.trim().length < 10) {
        throw new ApiError(400, "Please provide session details (minimum 10 characters)");
    }

    // Check order exists and is confirmed
    const order = await NewOrder.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Check if user is the mentor
    if (order.mentorId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the mentor can submit sessions");
    }

    // Check if order is in correct state
    if (order.orderStatus !== "confirmed") {
        throw new ApiError(400, "Order is not in active state");
    }

    // Get the next pending session
    const nextSession = await Session.findOne({
        orderId,
        status: "pending",
    }).sort({ sessionNumber: 1 });

    if (!nextSession) {
        // Check if all sessions are already approved
        const allSessions = await Session.find({ orderId });
        const allApproved = allSessions.every(s => s.status === "approved");

        if (allApproved) {
            throw new ApiError(400, "All sessions have been approved. You can now mark the order as delivered.");
        }

        // Check if there are any rejected sessions that can be resubmitted
        const rejectedSession = await Session.findOne({
            orderId,
            status: "rejected",
        }).sort({ sessionNumber: 1 });

        if (rejectedSession) {
            throw new ApiError(400, `Session ${rejectedSession.sessionNumber} was rejected. Please resubmit it.`);
        }

        throw new ApiError(400, "No pending sessions available to submit");
    }

    // Update session
    nextSession.description = description.trim();
    nextSession.status = "submitted";
    nextSession.submittedBy = req.user._id;
    nextSession.submittedAt = new Date();
    await nextSession.save();

    return res.status(200).json(
        new ApiResponse(200, nextSession, `Session ${nextSession.sessionNumber} submitted successfully`)
    );
});

// ==================== RESUBMIT REJECTED SESSION (MENTOR) ====================
export const resubmitSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { description } = req.body;

    if (!description || description.trim().length < 10) {
        throw new ApiError(400, "Please provide session details (minimum 10 characters)");
    }

    const session = await Session.findById(sessionId).populate("orderId");
    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    // Check if user is the mentor
    if (session.mentorId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the mentor can resubmit sessions");
    }

    // Check if session is rejected
    if (session.status !== "rejected") {
        throw new ApiError(400, "Only rejected sessions can be resubmitted");
    }

    // Check if order is in correct state
    if (session.orderId.orderStatus !== "confirmed") {
        throw new ApiError(400, "Order is not in active state");
    }

    // Update session
    session.description = description.trim();
    session.status = "submitted";
    session.submittedBy = req.user._id;
    session.submittedAt = new Date();
    session.studentFeedback = null; // Clear previous feedback
    session.rejectedAt = null;
    await session.save();

    return res.status(200).json(
        new ApiResponse(200, session, `Session ${session.sessionNumber} resubmitted successfully`)
    );
});

// ==================== APPROVE SESSION (STUDENT) ====================
export const approveSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId).populate("orderId");
    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    // Check if user is the student
    if (session.studentId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the student can approve sessions");
    }

    // Check if session is submitted
    if (session.status !== "submitted") {
        throw new ApiError(400, "Only submitted sessions can be approved");
    }

    // Update session
    session.status = "approved";
    session.approvedAt = new Date();
    await session.save();

    // Check if all sessions are approved
    const allSessions = await Session.find({ orderId: session.orderId._id });
    const allApproved = allSessions.every(s => s.status === "approved");

    return res.status(200).json(
        new ApiResponse(200, {
            session,
            allSessionsApproved: allApproved
        }, `Session ${session.sessionNumber} approved successfully`)
    );
});

// ==================== REJECT SESSION (STUDENT) ====================
export const rejectSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { feedback } = req.body;

    if (!feedback || feedback.trim().length < 5) {
        throw new ApiError(400, "Please provide feedback for rejection (minimum 5 characters)");
    }

    const session = await Session.findById(sessionId).populate("orderId");
    if (!session) {
        throw new ApiError(404, "Session not found");
    }

    // Check if user is the student
    if (session.studentId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the student can reject sessions");
    }

    // Check if session is submitted
    if (session.status !== "submitted") {
        throw new ApiError(400, "Only submitted sessions can be rejected");
    }

    // Update session
    session.status = "rejected";
    session.studentFeedback = feedback.trim();
    session.rejectedAt = new Date();
    await session.save();

    return res.status(200).json(
        new ApiResponse(200, session, `Session ${session.sessionNumber} rejected`)
    );
});

// ==================== CHECK IF ALL SESSIONS ARE APPROVED ====================
export const checkAllSessionsApproved = async (orderId) => {
    const sessions = await Session.find({ orderId });
    if (sessions.length === 0) return false;
    return sessions.every(s => s.status === "approved");
};

// ==================== GET SESSION STATUS FOR ORDER ====================
export const getSessionStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await NewOrder.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Check if user has access
    const isMentor = order.mentorId.toString() === req.user._id.toString();
    const isStudent = order.studentId.toString() === req.user._id.toString();
    const isAdmin = req.user.userType === "admin";

    if (!isMentor && !isStudent && !isAdmin) {
        throw new ApiError(403, "You don't have permission");
    }

    const sessions = await Session.find({ orderId });

    const stats = {
        total: sessions.length,
        pending: sessions.filter(s => s.status === "pending").length,
        submitted: sessions.filter(s => s.status === "submitted").length,
        approved: sessions.filter(s => s.status === "approved").length,
        rejected: sessions.filter(s => s.status === "rejected").length,
        allApproved: sessions.length > 0 && sessions.every(s => s.status === "approved"),
    };

    // Find the next session number to submit
    const nextPending = await Session.findOne({
        orderId,
        status: "pending",
    }).sort({ sessionNumber: 1 });

    const nextSessionNumber = nextPending ? nextPending.sessionNumber : null;

    // Check for rejected session
    const rejectedSession = await Session.findOne({
        orderId,
        status: "rejected",
    }).sort({ sessionNumber: 1 });

    return res.status(200).json(
        new ApiResponse(200, { stats, nextSessionNumber, rejectedSession }, "Session status fetched")
    );
});
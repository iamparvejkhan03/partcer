import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import {
  uploadChatFile,
  deleteMessage,
  createOrGetConversation,
  saveMessage,
  unsaveMessage,
  getSavedMessages,
  getResources,
  markAsResource,
  getOrCreateMeeting,
  updateMeeting,
  createMeeting,
  getUnreadMessages,
  markMessagesAsRead,
} from "../controllers/chat.controller.js";

const chatRouter = Router();

// File upload for chat messages
chatRouter.post(
  "/upload",
  auth,
  upload.single("messageAttachment"),
  uploadChatFile,
);

// Delete message
chatRouter.delete("/messages/:messageId", auth, deleteMessage);
chatRouter.post('/conversation', auth, createOrGetConversation);

// New routes for saved messages
chatRouter.post("/messages/:messageId/save", auth, saveMessage);
chatRouter.delete("/messages/:messageId/save", auth, unsaveMessage);
chatRouter.get("/saved-messages", auth, getSavedMessages);

// Resource routes
chatRouter.get("/conversations/:conversationId/resources", auth, getResources);
chatRouter.post("/messages/:messageId/resource", auth, markAsResource);

// Meeting routes
chatRouter.get("/conversations/:conversationId/meeting", auth, getOrCreateMeeting);
chatRouter.put("/meetings/:meetingId", auth, updateMeeting);
chatRouter.post("/conversations/:conversationId/meeting", auth, createMeeting);

chatRouter.get("/unread/count", auth, getUnreadMessages);
chatRouter.put("/mark-all-read", auth, markMessagesAsRead);

export default chatRouter;

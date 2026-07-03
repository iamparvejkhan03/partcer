import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadFile } from "../utils/cloudinary.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import SavedMessage from "../models/savedMessage.model.js";
import Meeting from "../models/meeting.model.js";
import User from "../models/user.model.js";
import { meetingNotificationForStudent } from "../utils/emailTemplates.js";
import transporter from "../utils/nodemailer.js";

export const uploadChatFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  try {
    const uploadResult = await uploadFile(
      req.file.buffer,
      req.file.originalname,
    );

    // Determine file type
    let fileType = "other";
    if (req.file.mimetype.startsWith("image/")) fileType = "image";
    else if (req.file.mimetype.startsWith("video/")) fileType = "video";
    else if (
      req.file.mimetype.includes("pdf") ||
      req.file.mimetype.includes("document")
    )
      fileType = "document";

    const fileData = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileType,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    };

    return res
      .status(200)
      .json(new ApiResponse(200, fileData, "File uploaded successfully"));
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new ApiError(500, "Failed to upload file");
  }
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (message.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own messages");
  }

  // Soft delete - mark as deleted for this user
  message.deletedFor.push(req.user._id);
  await message.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Message deleted successfully"));
});

export const createOrGetConversation = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const conversation = await Conversation.getOrCreate(req.user._id, userId);

  await conversation.populate(
    "participants",
    "firstName lastName profileImage userType",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, conversation, "Conversation ready"));
});

// Save a message
export const saveMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  // Check if already saved
  if (message.savedBy.includes(userId)) {
    throw new ApiError(400, "Message already saved");
  }

  message.savedBy.push(userId);
  await message.save();

  // Also store in saved messages collection for easier retrieval
  const savedMessage = await SavedMessage.create({
    messageId: message._id,
    userId: userId,
    conversation: message.conversation,
    messageContent: message.content,
    messageAttachments: message.attachments,
    sender: message.sender,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, savedMessage, "Message saved successfully"));
});

// Unsave a message
export const unsaveMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  message.savedBy = message.savedBy.filter(
    (id) => id.toString() !== userId.toString()
  );
  await message.save();

  // Remove from saved messages collection
  await SavedMessage.findOneAndDelete({ messageId, userId });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Message unsaved successfully"));
});

// Get saved messages for a user
export const getSavedMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.query;
  const userId = req.user._id;

  const filter = { userId };
  if (conversationId) {
    filter.conversation = conversationId;
  }

  const savedMessages = await SavedMessage.find(filter)
    .populate("sender", "firstName lastName profileImage")
    .sort({ savedAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, savedMessages, "Saved messages retrieved"));
});

// Get resources (files shared by mentor)
export const getResources = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const resources = await Message.find({
    conversation: conversationId,
    isResource: true,
    "attachments.0": { $exists: true }, // Has attachments
  })
    .populate("sender", "firstName lastName profileImage userType")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, resources, "Resources retrieved"));
});

// Mark message as resource (for files shared by mentor)
export const markAsResource = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  // Only mentor can mark as resource
  const conversation = await Conversation.findById(message.conversation);
  const isMentor = conversation.participants[0].toString() === req.user._id.toString();

  if (!isMentor) {
    throw new ApiError(403, "Only mentor can mark resources");
  }

  message.isResource = true;
  await message.save();

  return res
    .status(200)
    .json(new ApiResponse(200, message, "Message marked as resource"));
});

// Get or create meeting details
export const getOrCreateMeeting = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  // Only get meeting if it exists, don't create automatically
  const meeting = await Meeting.findOne({ conversation: conversationId });

  if (!meeting) {
    // Return 404 or null instead of auto-creating
    return res
      .status(200)
      .json(new ApiResponse(200, null, "No meeting found for this conversation"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, meeting, "Meeting details retrieved"));
});

// Update meeting details
export const updateMeeting = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const { meetingLink, meetingId: meetId, passcode, platform, isPermanent, meetingName } = req.body;

  const meeting = await Meeting.findByIdAndUpdate(
    meetingId,
    {
      meetingName,
      meetingLink,
      meetingId: meetId,
      passcode,
      platform,
      isPermanent,
      lastUpdated: Date.now(),
    },
    { new: true }
  );

  const student = await User.findById(meeting.learnerId);
  const mentor = await User.findById(meeting.mentorId);

  if (student && mentor) {
    meetingNotificationForStudent(transporter, student, mentor, meeting, 'updated')
      .catch(err => console.error(`Meeting update email failed for ${student.email}:`, err.message));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, meeting, "Meeting details updated"));
});

// Helper functions
function generateMeetingId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  result += '-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  result += '-';
  for (let i = 0; i < 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generatePasscode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a new meeting (mentor only)
export const createMeeting = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { meetingLink, meetingId, passcode, platform, isPermanent, meetingName } = req.body;

  if (!meetingLink) {
    throw new ApiError(400, "Meeting link is required");
  }

  if (!meetingName) {
    throw new ApiError(400, "Meeting name is required");
  }

  // Check if meeting already exists
  // const existingMeeting = await Meeting.findOne({ conversation: conversationId });
  // if (existingMeeting) {
  //   throw new ApiError(400, "Meeting already exists for this conversation");
  // }

  // Get conversation to find participants
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  // Check if user is a participant
  if (!conversation.participants.includes(req.user._id)) {
    throw new ApiError(403, "You are not a participant in this conversation");
  }

  // Determine mentor and learner (assuming first participant is mentor based on your getOrCreate)
  // If you have userType in participants, use that instead
  const mentorId = conversation.participants[0];
  const learnerId = conversation.participants[1];

  // Only mentor can create meeting
  if (mentorId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the mentor can set up meeting details");
  }

  const meeting = await Meeting.create({
    conversation: conversationId,
    mentorId,
    learnerId,
    meetingName,
    meetingLink,
    meetingId: meetingId || "",
    passcode: passcode || "",
    platform: platform || "Google Meet",
    isPermanent: isPermanent || false,
    lastUpdated: Date.now(),
  });

  // Populate response
  await meeting.populate("mentorId", "firstName lastName profileImage");
  await meeting.populate("learnerId", "firstName lastName profileImage");

  const student = await User.findById(meeting.learnerId).select("firstName lastName email");
  const mentor = await User.findById(meeting.mentorId).select("firstName lastName");

  if (student && mentor) {
    meetingNotificationForStudent(transporter, student, mentor, meeting, 'created')
      .catch(err => console.error(`Meeting creation email failed for ${student.email}:`, err.message));
  }

  return res
    .status(201)
    .json(new ApiResponse(201, meeting, "Meeting created successfully"));
});

// Get all meetings for a conversation
export const getAllMeetings = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const meetings = await Meeting.find({ conversation: conversationId })
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, meetings, "Meetings retrieved successfully"));
});

// Delete a meeting
export const deleteMeeting = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;

  const meeting = await Meeting.findById(meetingId);
  if (!meeting) {
    throw new ApiError(404, "Meeting not found");
  }

  // Check if user is the mentor who created it
  if (meeting.mentorId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this meeting");
  }

  await meeting.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Meeting deleted successfully"));
});

export const getUnreadMessages = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    // Count unread messages where user is the receiver
    const count = await Message.countDocuments({
      receiver: userId,
      status: { $in: ['sent', 'delivered'] },
      'readBy.user': { $ne: userId }
    });

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread messages count'
    });
  }
})

export const markMessagesAsRead = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    // Update all messages where user is the receiver and not yet read
    const result = await Message.updateMany(
      {
        receiver: userId,
        'readBy.user': { $ne: userId }
      },
      {
        $push: { readBy: { user: userId, readAt: new Date() } },
        status: "read"
      }
    );

    // Reset unread counts in all conversations
    await Conversation.updateMany(
      { participants: userId },
      { $set: { [`unreadCount.${userId.toString()}`]: 0 } }
    );

    res.status(200).json({
      success: true,
      message: 'All messages marked as read',
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
})
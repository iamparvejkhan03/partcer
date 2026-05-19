import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { uploadFile } from "../utils/cloudinary.js";

// Store online users
const onlineUsers = new Map();

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: [
        "https://www.partcer.com",
        "https://partcer.com",
        "https://partcer-frontend.onrender.com",
        "https://partcer-backend.onrender.com",
        "http://localhost:5173",
      ],
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"], // Add polling as fallback
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.id).select(
        "-password -refreshToken",
      );

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `🔌 User connected: ${socket.user?.firstName} ${socket.user?.lastName}`,
    );

    // Add user to online users
    onlineUsers.set(socket.user._id.toString(), {
      socketId: socket.id,
      user: socket.user,
    });

    // Join user to their personal room
    socket.join(socket.user._id.toString());

    // Broadcast online status to all connected users
    io.emit("users:online", Array.from(onlineUsers.keys()));

    // Handle getting conversations
    socket.on("conversations:get", async () => {
      try {
        const conversations = await Conversation.find({
          participants: socket.user._id,
        })
          .populate("participants", "firstName lastName profileImage userType")
          .populate("lastMessage")
          .sort({ lastMessageAt: -1 });

        // Add online status to participants
        const conversationsWithStatus = conversations.map((conv) => {
          const convObj = conv.toObject();
          convObj.participants = convObj.participants.map((participant) => ({
            ...participant,
            isOnline: onlineUsers.has(participant._id.toString()),
          }));
          return convObj;
        });

        socket.emit("conversations:list", conversationsWithStatus);
      } catch (error) {
        console.error("Error getting conversations:", error);
        socket.emit("error", { message: "Failed to get conversations" });
      }
    });

    // Handle getting messages for a conversation
    socket.on("messages:get", async ({ conversationId }) => {
      try {
        const messages = await Message.find({
          conversation: conversationId,
          isDeleted: false,
          deletedFor: { $ne: socket.user._id },
        })
          .populate("sender", "firstName lastName profileImage userType")
          .populate("receiver", "firstName lastName profileImage userType")
          .sort({ createdAt: 1 }); // Sort ascending (oldest first)

        socket.emit("messages:list", {
          conversationId,
          messages,
        });
      } catch (error) {
        console.error("Error getting messages:", error);
        socket.emit("error", { message: "Failed to get messages" });
      }
    });

    // Handle sending messages
    socket.on("message:send", async ({ receiverId, content, attachments }) => {
      try {
        // Validate
        if (!receiverId) {
          socket.emit("error", { message: "Receiver ID is required" });
          return;
        }

        // Get or create conversation
        const conversation = await Conversation.getOrCreate(
          socket.user._id.toString(),
          receiverId.toString(),
        );

        // Process attachments - NO RE-UPLOADING, just use the data from frontend
        const messageAttachments =
          attachments && attachments.length > 0
            ? attachments.map((attachment) => ({
              url: attachment.url,
              publicId: attachment.publicId,
              fileType:
                attachment.fileType || determineFileType(attachment.mimeType),
              fileName: attachment.fileName,
              fileSize: attachment.fileSize,
              mimeType: attachment.mimeType,
            }))
            : [];

        // Create message
        const message = await Message.create({
          conversation: conversation._id,
          sender: socket.user._id,
          receiver: receiverId,
          content: content || "",
          attachments: messageAttachments,
          status: "sent",
          deliveredTo: [],
          readBy: [],
        });

        // First, populate the conversation to get participants with their userType
        await conversation.populate("participants", "userType _id");

        const senderInConversation = conversation.participants.find(
          (p) => p._id.toString() === socket.user._id.toString()
        );

        const isMentor = senderInConversation?.userType === "freelancer";

        if (isMentor && messageAttachments && messageAttachments.length > 0) {
          message.isResource = true;
          await message.save();
        }

        // Update conversation
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = new Date();

        // Increment unread count for receiver
        const currentUnread = conversation.unreadCount.get(receiverId.toString()) || 0;
        conversation.unreadCount.set(receiverId.toString(), currentUnread + 1);
        await conversation.save();

        // Populate sender info
        await message.populate(
          "sender",
          "firstName lastName profileImage userType",
        );
        await message.populate(
          "receiver",
          "firstName lastName profileImage userType",
        );

        // Update conversation
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = new Date();

        // Update unread count for receiver
        const receiverUnread =
          conversation.unreadCount.get(receiverId.toString()) || 0;
        conversation.unreadCount.set(receiverId.toString(), receiverUnread + 1);

        await conversation.save();

        // Emit to sender (for immediate display)
        socket.emit("message:sent", message);

        // Emit to receiver if online
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) {
          io.to(receiverSocket.socketId).emit("message:received", message);

          // Update conversation list for receiver
          const updatedConversation = await Conversation.findById(
            conversation._id,
          )
            .populate(
              "participants",
              "firstName lastName profileImage userType",
            )
            .populate("lastMessage");

          io.to(receiverSocket.socketId).emit(
            "conversation:updated",
            updatedConversation,
          );
        }

        // Update conversation list for sender
        const updatedSenderConversation = await Conversation.findById(
          conversation._id,
        )
          .populate("participants", "firstName lastName profileImage userType")
          .populate("lastMessage");

        socket.emit("conversation:updated", updatedSenderConversation);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Helper function to determine file type
    function determineFileType(mimeType) {
      if (!mimeType) return "other";
      if (mimeType.startsWith("image/")) return "image";
      if (mimeType.startsWith("video/")) return "video";
      if (mimeType.includes("pdf") || mimeType.includes("document"))
        return "document";
      return "other";
    }

    // Handle typing indicators
    socket.on("typing:start", ({ receiverId }) => {
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket.socketId).emit("typing:start", {
          senderId: socket.user._id,
          senderName: `${socket.user.firstName} ${socket.user.lastName}`,
        });
      }
    });

    socket.on("typing:stop", ({ receiverId }) => {
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket) {
        io.to(receiverSocket.socketId).emit("typing:stop", {
          senderId: socket.user._id,
        });
      }
    });

    // Handle marking messages as read
    socket.on("messages:read", async ({ conversationId }) => {
      try {
        await Message.updateMany(
          {
            conversation: conversationId,
            receiver: socket.user._id,
            "readBy.user": { $ne: socket.user._id },
          },
          {
            $push: { readBy: { user: socket.user._id, readAt: new Date() } },
            status: "read",
          },
        );

        // Reset unread count for this user in conversation
        await Conversation.updateOne(
          { _id: conversationId },
          { $set: { [`unreadCount.${socket.user._id.toString()}`]: 0 } },
        );

        // Notify other participant that messages were read
        const conversation = await Conversation.findById(conversationId);
        const otherParticipant = conversation.participants.find(
          (p) => p.toString() !== socket.user._id.toString(),
        );

        const otherSocket = onlineUsers.get(otherParticipant?.toString());
        if (otherSocket) {
          io.to(otherSocket.socketId).emit("messages:read", {
            conversationId,
            readerId: socket.user._id,
          });
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // Handle file upload for messages
    socket.on("file:upload", async ({ receiverId, file }) => {
      try {
        // This is a placeholder - actual file upload will be handled via REST API
        // because file uploads are better handled through HTTP
        socket.emit("error", {
          message: "Please use the file upload endpoint for attachments",
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        socket.emit("error", { message: "Failed to upload file" });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(
        `🔌 User disconnected: ${socket.user?.firstName} ${socket.user?.lastName}`,
      );
      onlineUsers.delete(socket.user._id.toString());

      // Broadcast offline status
      io.emit("users:online", Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

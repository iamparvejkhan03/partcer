import mongoose from "mongoose";

const savedMessageSchema = new mongoose.Schema(
    {
        messageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },
        messageContent: String,
        messageAttachments: Array,
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        savedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

savedMessageSchema.index({ userId: 1, conversation: 1 });
savedMessageSchema.index({ messageId: 1, userId: 1 }, { unique: true });

const SavedMessage = mongoose.model("SavedMessage", savedMessageSchema);
export default SavedMessage;
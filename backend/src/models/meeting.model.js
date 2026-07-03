import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },
        mentorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        learnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        meetingName: {
            type: String,
            required: true,
        },
        meetingLink: {
            type: String,
            required: true,
        },
        meetingId: String,
        passcode: String,
        isPermanent: {
            type: Boolean,
            default: false,
        },
        platform: {
            type: String,
            enum: ["Google Meet", "Zoom", "Microsoft Teams", "Jitsi Meet", "Whereby", "Zoho Meeting", "Other"],
            default: "Google Meet",
        },
        scheduledTime: Date,
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;
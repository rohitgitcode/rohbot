import mongoose from 'mongoose';

// Single message ka schema (User prompt & AI response)
const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    hasContext: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Entire conversation thread ka schema
const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Fast querying per user ke liye
    },
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bot',
      default: null,
      index: true, // Multi-tenant bot isolation
    },
    title: {
      type: String,
      default: 'New Conversation',
      trim: true,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

// Compound index for fast retrieval of chats by a user for a specific bot
chatSchema.index({ userId: 1, botId: 1, updatedAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
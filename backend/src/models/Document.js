import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bot',
      required: true,
      index: true, // Multi-tenant speed up ke liye
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'txt', 'faq', 'url'],
      default: 'pdf',
    },
    sourceUrl: {
      type: String,
      default: '',
    },
    characterCount: {
      type: Number,
      default: 0,
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['processing', 'ready', 'failed'],
      default: 'processing',
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index for querying documents belonging to a bot filtered/sorted by status
documentSchema.index({ botId: 1, status: 1 });

const Document = mongoose.model('Document', documentSchema);

export default Document;
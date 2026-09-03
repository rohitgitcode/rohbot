import mongoose from 'mongoose';

const botSchema = new mongoose.Schema(
  {
    // 1. Ownership (C1 ka account)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    // 2. Bot Identity & AI Personality
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'My Custom Assistant', 
    },
    systemPrompt: {
      type: String,
      default: 'You are a helpful customer support assistant. Answer queries concisely based strictly on the provided context.',
    },

    // 3. Widget Appearance (Frontend UI)
    appearance: {
      themeColor: { type: String, default: '#3B82F6' }, // Default Tailwind Blue
      welcomeMessage: { type: String, default: 'Hi there! How can I help you today?' },
      avatarUrl: { type: String, default: '' },
    },

    // 4. Security (Strict CORS & Allowed Domains)
    allowedDomains: [
      {
        type: String,
        trim: true,
        lowercase: true,
      }
    ],

    // 5. Subscription & Billing Status
    subscription: {
      status: {
        type: String,
        enum: ['trial', 'active', 'expired', 'cancelled'],
        default: 'trial',
      },
      plan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free',
      },
      currentPeriodEnd: {
        type: Date,
        default: () => new Date(+new Date() + 2 * 24 * 60 * 60 * 1000), // 2 days free trial by default
      }
    },

    // 6. Usage Tracking (Cost Optimization)
    usage: {
      messageCount: { type: Number, default: 0 },
      tokenCount: { type: Number, default: 0 },
    },

    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

const Bot = mongoose.model('Bot', botSchema);

export default Bot;
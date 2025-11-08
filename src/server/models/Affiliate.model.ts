// src/server/models/Affiliate.model.ts
import { Schema, model, Document, Types, Model } from 'mongoose';
import crypto from 'crypto';

/**
 * @interface IPayout
 * Represents a payout history record.
 */
interface IPayout {
  amount: number;
  date: Date;
}

/**
 * @interface IAffiliate
 * Represents an affiliate user in the system.
 */
export interface IAffiliate extends Document {
  // Reference to the User who is an affiliate
  user: Types.ObjectId;

  // Unique affiliate code
  affiliateCode: string;

  // Status of the affiliate account
  status: 'pending' | 'active' | 'suspended' | 'rejected';

  // Current unpaid balance
  balance: number;

  // Total earnings since joining
  totalEarnings: number;

  // Total clicks on affiliate links
  clicks: number;

  // Total successful conversions/sales
  conversions: number;

  // Complete payout history
  payoutHistory: IPayout[];

  // Affiliate's website URL (optional)
  websiteUrl?: string;

  // Internal notes for admins
  notes?: string;
}

/**
 * @interface IAffiliateModel
 * Optional interface for static methods on the Affiliate model.
 */
export interface IAffiliateModel extends Model<IAffiliate> {
  findByUser(userId: Types.ObjectId): Promise<IAffiliate | null>;
}

/**
 * Generates a unique affiliate code.
 * @param model - Affiliate model to check for uniqueness
 * @returns Unique uppercase hex code
 */
async function generateUniqueCode(model: any): Promise<string> {
  let code: string;
  let isUnique = false;
  let attempts = 0;

  do {
    code = crypto.randomBytes(4).toString('hex').toUpperCase();
    const existing = await model.findOne({ affiliateCode: code });
    if (!existing) isUnique = true;

    attempts++;
    if (attempts > 10) throw new Error('Unable to generate unique affiliate code');
  } while (!isUnique);

  return code;
}

// --- Affiliate Schema ---
const affiliateSchema = new Schema<IAffiliate>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Affiliate must be linked to a User.'],
      unique: true,
    },
    affiliateCode: {
      type: String,
      required: [true, 'Affiliate code is required.'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'active', 'suspended', 'rejected'],
        message: 'Status must be pending, active, suspended, or rejected.',
      },
      default: 'pending',
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative.'],
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: [0, 'Total earnings cannot be negative.'],
    },
    clicks: {
      type: Number,
      default: 0,
      min: [0, 'Clicks cannot be negative.'],
    },
    conversions: {
      type: Number,
      default: 0,
      min: [0, 'Conversions cannot be negative.'],
    },
    payoutHistory: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, required: true },
      },
    ],
    websiteUrl: {
      type: String,
      trim: true,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please provide a valid website URL.',
      ],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// --- Indexes for Performance ---
affiliateSchema.index({ user: 1 });
affiliateSchema.index({ affiliateCode: 1 });
affiliateSchema.index({ conversions: 1 }); // useful for querying top-performing affiliates

// --- Middleware ---
// Automatically generate a unique affiliate code on new documents
affiliateSchema.pre('save', async function (next) {
  if (this.isNew && !this.affiliateCode) {
    this.affiliateCode = await generateUniqueCode(this.constructor);
  }
  next();
});

// --- Static Methods ---
affiliateSchema.statics.findByUser = function (userId: Types.ObjectId) {
  return this.findOne({ user: userId });
};

// --- Export the Model ---
export const Affiliate = model<IAffiliate, IAffiliateModel>('Affiliate', affiliateSchema);

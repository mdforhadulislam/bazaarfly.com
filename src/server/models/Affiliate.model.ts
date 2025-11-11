// src/server/models/Affiliate.model.ts
import { Schema, model, Document, Types, Model } from 'mongoose';
import crypto from 'crypto';

export interface IAffiliate extends Document {
  user: Types.ObjectId;
  affiliateCode: string; // ইউনিক কোড, যেমন: XYZ123
  status: 'active' | 'suspended';
  
  // --- অ্যানালিটিক্স ---
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number; // মোট যা এপর্যন্ত উপার্জন করেছে
  totalWithdrawn: number; // মোট যা উত্তোলন করেছে

  // --- অন্যান্য ---
  websiteUrl?: string;
  notes?: string; // অ্যাডমিনের জন্য নোট

  // --- ভার্চুয়াল ---
  conversionRate?: number; // কনভার্সন রেট
  currentBalance?: number; // বর্তমান ব্যালেন্স (Wallet থেকে)
}

export interface IAffiliateModel extends Model<IAffiliate> {
  findByUser(userId: Types.ObjectId): Promise<IAffiliate | null>;
}

const affiliateSchema = new Schema<IAffiliate>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  affiliateCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  totalClicks: { type: Number, default: 0 },
  totalConversions: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  websiteUrl: { type: String, trim: true },
  notes: { type: String, trim: true },
}, { timestamps: true });

// --- ভার্চুয়াল ফিল্ড ---
affiliateSchema.virtual('conversionRate').get(function(this: IAffiliate) {
  if (this.totalClicks === 0) return 0;
  return parseFloat(((this.totalConversions / this.totalClicks) * 100).toFixed(2));
});

affiliateSchema.virtual('currentBalance', {
  ref: 'Wallet',
  localField: '_id',
  foreignField: 'affiliate',
  justOne: true
});

// --- ইনডেক্স ---
affiliateSchema.index({ user: 1 });
affiliateSchema.index({ affiliateCode: 1 });
affiliateSchema.index({ totalConversions: -1 }); // শীর্ষ অ্যাফিলিয়েটদের খুঁজতে

// --- মিডলওয়্যার ---
affiliateSchema.pre('save', async function (next) {
  if (this.isNew && !this.affiliateCode) {
    let code: string; let isUnique = false;
    do {
      code = crypto.randomBytes(4).toString('hex').toUpperCase();
      const existing = await this.constructor.findOne({ affiliateCode: code });
      if (!existing) isUnique = true;
    } while (!isUnique);
    this.affiliateCode = code;
  }
  next();
});

affiliateSchema.statics.findByUser = function (userId: Types.ObjectId) {
  return this.findOne({ user: userId });
};

export const Affiliate = model<IAffiliate, IAffiliateModel>('Affiliate', affiliateSchema);
// src/server/models/Analytics.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IAnalytics extends Document {
  date: Date;
  totalRevenue: number;
  totalOrders: number;
  totalAffiliateEarnings: number;
  topAffiliates: { affiliateId: string; name: string; earnings: number }[];
  topProducts: { productId: string; name: string; sales: number }[];
}

const analyticsSchema = new Schema<IAnalytics>({
  date: { type: Date, required: true, unique: true },
  totalRevenue: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalAffiliateEarnings: { type: Number, default: 0 },
  topAffiliates: [{ affiliateId: String, name: String, earnings: Number }],
  topProducts: [{ productId: String, name: String, sales: Number }],
}, { timestamps: true });

export const Analytics = model<IAnalytics>('Analytics', analyticsSchema);
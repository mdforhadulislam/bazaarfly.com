// src/server/models/Link.model.ts
import { Document, Schema, Types, model } from "mongoose";

export interface ILink extends Document {
  affiliate: Types.ObjectId;
  product: Types.ObjectId;
  slug: string; // পাবলিক URL slug, যেমন: aff/XYZ123/product-abc
  commissionPercent: number; // লিঙ্ক তৈরির সময় প্রোডাক্টের কমিশন রেট সেভ করে রাখা
  clicks: number;
  conversions: number;
  isActive: boolean;
}

const linkSchema = new Schema<ILink>(
  {
    affiliate: {
      type: Schema.Types.ObjectId,
      ref: "Affiliate",
      required: true,
    },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    slug: { type: String, required: true, unique: true },
    commissionPercent: { type: Number, required: true, min: 0, max: 100 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// --- ইনডেক্স ---
linkSchema.index({ affiliate: 1, product: 1 });
linkSchema.index({ slug: 1 });

export const Link = model<ILink>("Link", linkSchema);

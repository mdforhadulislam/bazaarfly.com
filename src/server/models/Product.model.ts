// src/server/models/Product.model.ts
import { Document, Schema, Types, model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  discountPrice?: number;
  sku: string;
  stock: number;
  commissionPercent: number; // প্রোডাক্টটির ডিফল্ট কমিশন হার
  category: Types.ObjectId;
  tags: Types.ObjectId[];
  images: string[];
  status: "active" | "inactive" | "out_of_stock" | "draft";
  metaTitle?: string;
  metaDescription?: string;
}

const productSchema = new Schema<IProduct>(
  {
    // ... (অন্যান্য ফিল্ড আগের মতোই)
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    sku: { type: String, required: true, unique: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    commissionPercent: { type: Number, default: 0, min: 0, max: 100 }, // এই ফিল্ডটি যোগ করুন
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    images: [{ type: String }],
    status: {
      type: String,
      enum: ["active", "inactive", "out_of_stock", "draft"],
      default: "draft",
    },
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual("finalPrice").get(function (this: IProduct) {
  return this.discountPrice && this.discountPrice < this.basePrice
    ? this.discountPrice
    : this.basePrice;
});
productSchema.index({ name: "text", description: "text" });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });

export const Product = model<IProduct>("Product", productSchema);

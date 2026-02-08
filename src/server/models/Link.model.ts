import {
  Schema,
  model,
  Document,
  Model,
  Types,
  models,
} from "mongoose";
import slugify from "slugify";

// ------------------------------------------------------
// INTERFACES
// ------------------------------------------------------

export interface ILink extends Document {
  affiliate: Types.ObjectId;
  product: Types.ObjectId;

  slug: string;
  commissionPercent: number;

  clicks: number;
  conversions: number;
  isActive: boolean;

  tag?: string; // ⭐ NEW FIELD

  createdAt: Date;
  updatedAt: Date;
}

export interface ILinkMethods {
  addClick(): Promise<void>;
  addConversion(): Promise<void>;
}

export interface ILinkStatics {
  generateSlug(productName: string, affiliateCode: string): Promise<string>;
}

export type LinkModelType = Model<ILink, Record<string, never>, ILinkMethods> & ILinkStatics;

// ------------------------------------------------------
// SCHEMA
// ------------------------------------------------------

const linkSchema = new Schema<ILink, LinkModelType, ILinkMethods>(
  {
    affiliate: {
      type: Schema.Types.ObjectId,
      ref: "Affiliate",
      required: true,
      index: true,
    },

    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    commissionPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true, index: true },

    // ⭐ NEW FIELD ADDED HERE
    tag: {
      type: String,
      trim: true,
      minlength: 1,
      maxlength: 80,
      index: true,
    },
  },
  { timestamps: true }
);

// ------------------------------------------------------
// INDEXES
// ------------------------------------------------------

linkSchema.index({ slug: 1 });
linkSchema.index({ affiliate: 1, product: 1 });
linkSchema.index({ tag: 1 }); // ⭐ Searching by tag

// ------------------------------------------------------
// STATIC METHOD — GENERATE UNIQUE SLUG
// ------------------------------------------------------

linkSchema.statics.generateSlug = async function (
  productName: string,
  affiliateCode: string
): Promise<string> {
  const base = slugify(`${productName}-${affiliateCode}`, {
    lower: true,
    strict: true,
  });

  let finalSlug = base;

  let counter = 1;
  while (await this.exists({ slug: finalSlug })) {
    finalSlug = `${base}-${counter}`;
    counter++;
  }

  return finalSlug;
};

// ------------------------------------------------------
// INSTANCE METHODS
// ------------------------------------------------------

linkSchema.methods.addClick = async function (): Promise<void> {
  this.clicks += 1;
  await this.save();
};

linkSchema.methods.addConversion = async function (): Promise<void> {
  this.conversions += 1;
  await this.save();
};

// ------------------------------------------------------
// EXPORT MODEL
// ------------------------------------------------------

export const Link =
  (models.Link as LinkModelType) ||
  model<ILink, LinkModelType>("Link", linkSchema);

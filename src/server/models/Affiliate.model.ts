import {
  Schema,
  model,
  Document,
  Types,
  Model,
  models
} from "mongoose";
import crypto from "crypto";

// ------------------------------------------------------
// INTERFACES
// ------------------------------------------------------

export interface IAffiliate extends Document {
  user: Types.ObjectId;
  affiliateCode: string;
  status: "active" | "suspended";

  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  totalWithdrawn: number;

  websiteUrl?: string;
  notes?: string;

  // virtuals
  conversionRate?: number;
  currentBalance?: unknown; // populated from Wallet
}

// STATIC METHODS INTERFACE
export interface IAffiliateStatics {
  findByUser(userId: Types.ObjectId): Promise<IAffiliate | null>;
}

// Combined Model Type
export type AffiliateModelType = Model<IAffiliate> & IAffiliateStatics;

// ------------------------------------------------------
// SCHEMA
// ------------------------------------------------------

const affiliateSchema = new Schema<IAffiliate, AffiliateModelType>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    affiliateCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },

    totalClicks: { type: Number, default: 0 },
    totalConversions: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },

    websiteUrl: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ------------------------------------------------------
// VIRTUALS
// ------------------------------------------------------

affiliateSchema.virtual("conversionRate").get(function (this: IAffiliate) {
  if (this.totalClicks === 0) return 0;
  return Number(((this.totalConversions / this.totalClicks) * 100).toFixed(2));
});

affiliateSchema.virtual("currentBalance", {
  ref: "Wallet",
  localField: "_id",
  foreignField: "affiliate",
  justOne: true,
});

// ------------------------------------------------------
// INDEXES
// ------------------------------------------------------

affiliateSchema.index({ user: 1 });
affiliateSchema.index({ affiliateCode: 1 });
affiliateSchema.index({ totalConversions: -1 });

// ------------------------------------------------------
// PRE-SAVE HOOK → Generate Unique Code
// ------------------------------------------------------
affiliateSchema.pre("save", async function (next) {
  if (this.isNew && !this.affiliateCode) {

    const AffiliateModel = this.constructor as AffiliateModelType;

    let code = "";
    let exists = true;

    while (exists) {
      code = crypto.randomBytes(4).toString("hex").toUpperCase();

      const found = await AffiliateModel.findOne({ affiliateCode: code });
      exists = Boolean(found); // <-- strict fix
    }

    this.affiliateCode = code;
  }

  next();
});
// ------------------------------------------------------
// STATIC METHODS
// ------------------------------------------------------

affiliateSchema.statics.findByUser = function (
  userId: Types.ObjectId
): Promise<IAffiliate | null> {
  return this.findOne({ user: userId });
};

// ------------------------------------------------------
// EXPORT MODEL
// ------------------------------------------------------

export const Affiliate =
  (models.Affiliate as AffiliateModelType) ||
  model<IAffiliate, AffiliateModelType>("Affiliate", affiliateSchema);

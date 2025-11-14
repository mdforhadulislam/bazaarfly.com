import { Document, Model, model, models, Schema, Types } from "mongoose";

// --------------------------------------------------
// INTERFACE
// --------------------------------------------------

export interface IAffiliateApplication extends Document {
  user: Types.ObjectId;
  applicationId: string;
  status: "pending" | "approved" | "rejected";
  message?: string;
  adminResponse?: string;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export interface IAffiliateApplicationStatics {
  generateNextId(): Promise<string>;
}

export type AffiliateApplicationModelType = Model<IAffiliateApplication> &
  IAffiliateApplicationStatics;

// --------------------------------------------------
// SCHEMA
// --------------------------------------------------

const applicationSchema = new Schema<
  IAffiliateApplication,
  AffiliateApplicationModelType
>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    applicationId: {
      type: String,
      unique: true,
      required: true,
      index: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    message: { type: String, trim: true },

    adminResponse: { type: String, trim: true },

    reviewedAt: { type: Date },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// --------------------------------------------------
// INDEXES
// --------------------------------------------------

applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });

// --------------------------------------------------
// STATIC METHOD
// --------------------------------------------------

applicationSchema.statics.generateNextId = async function (): Promise<string> {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `APP-${today}-`;

  const lastApp = await this.findOne({
    applicationId: { $regex: `^${prefix}` },
  })
    .sort({ applicationId: -1 })
    .lean<{ applicationId: string } | null>();

  let nextNum = 1;

  if (lastApp?.applicationId) {
    const lastNum = Number(lastApp.applicationId.split("-").pop());
    if (!Number.isNaN(lastNum)) nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, "0")}`;
};

// --------------------------------------------------
// PRE-SAVE HOOK
// --------------------------------------------------

applicationSchema.pre("validate", async function (next) {
  if (!this.applicationId) {
    this.applicationId = await (
      this.constructor as AffiliateApplicationModelType
    ).generateNextId();
  }
  next();
});

// --------------------------------------------------
// EXPORT MODEL
// --------------------------------------------------

export const AffiliateApplication =
  (models.AffiliateApplication as AffiliateApplicationModelType) ||
  model<IAffiliateApplication, AffiliateApplicationModelType>(
    "AffiliateApplication",
    applicationSchema
  );

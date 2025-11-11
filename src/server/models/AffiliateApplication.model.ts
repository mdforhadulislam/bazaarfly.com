import { Document, Schema, Types, model, models } from "mongoose";

export interface IAffiliateApplication extends Document {
  user: Types.ObjectId;
  applicationId: string;
  status: "pending" | "approved" | "rejected";
  message?: string;
  adminResponse?: string;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
}

const applicationSchema = new Schema<IAffiliateApplication>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    applicationId: { type: String, unique: true }, // <-- not required
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    message: { type: String, trim: true },
    adminResponse: { type: String, trim: true },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

applicationSchema.pre("save", async function (next) {
  if (this.isNew && !this.applicationId) {
    console.log("Generating new applicationId for:", this.user);
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const prefix = `APP-${today}-`;
    const lastApp = await (this.constructor as any)
      .findOne({ applicationId: { $regex: `^${prefix}` } })
      .sort("-applicationId");
    let newId = "0001";
    if (lastApp) {
      const lastIdNum = parseInt(lastApp.applicationId.split("-").pop() || "0");
      newId = String(lastIdNum + 1).padStart(4, "0");
    }
    this.applicationId = `${prefix}${newId}`;
  }
  next();
});

export const AffiliateApplication =
  models.AffiliateApplication ||
  model<IAffiliateApplication>("AffiliateApplication", applicationSchema);

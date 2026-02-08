import { Schema, model, Document, Model, models } from "mongoose";

// --------------------------------------------------
// INTERFACES
// --------------------------------------------------

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  image: string;
  link?: string;

  position: "home_top" | "home_middle" | "category_page";
  devices: ("mobile" | "desktop" | "tablet")[];

  isActive: boolean;
  priority: number;

  startDate: Date;
  endDate: Date;

  clicks: number;
  impressions: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface IBannerStatics {
  getActiveBanners(): Promise<IBanner[]>;
  recordClick(bannerId: string): Promise<void>;
  recordImpression(bannerId: string): Promise<void>;
}

export type BannerModelType = Model<IBanner> & IBannerStatics;

// --------------------------------------------------
// SCHEMA
// --------------------------------------------------

const bannerSchema = new Schema<IBanner, BannerModelType>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },

    image: { type: String, required: true, trim: true },
    link: { type: String, trim: true },

    // Where to display
    position: {
      type: String,
      enum: ["home_top", "home_middle", "category_page"],
      default: "home_top",
      index: true,
    },

    // Target devices
    devices: {
      type: [String],
      enum: ["mobile", "desktop", "tablet"],
      default: ["mobile", "desktop"],
    },

    isActive: { type: Boolean, default: true, index: true },

    priority: { type: Number, default: 1 },

    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },

    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// --------------------------------------------------
// INDEXES
// --------------------------------------------------

bannerSchema.index({ priority: -1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

// --------------------------------------------------
// STATIC METHODS
// --------------------------------------------------

/**
 * Fetch active banners (automatically filters by dates)
 */
bannerSchema.statics.getActiveBanners = function (): Promise<IBanner[]> {
  const today = new Date();

  return this.find({
    isActive: true,
    startDate: { $lte: today },
    endDate: { $gte: today },
  })
    .sort({ priority: -1 }) // highest priority first
    .lean<IBanner[]>()
    .exec();
};

/**
 * Track banner clicks
 */
bannerSchema.statics.recordClick = async function (
  bannerId: string
): Promise<void> {
  await this.findByIdAndUpdate(bannerId, { $inc: { clicks: 1 } });
};

/**
 * Track impressions
 */
bannerSchema.statics.recordImpression = async function (
  bannerId: string
): Promise<void> {
  await this.findByIdAndUpdate(bannerId, { $inc: { impressions: 1 } });
};

// --------------------------------------------------
// EXPORT MODEL
// --------------------------------------------------

export const Banner =
  (models.Banner as BannerModelType) ||
  model<IBanner, BannerModelType>("Banner", bannerSchema);

import { Schema, model, Document, Model, models } from "mongoose";

// --------------------------------------------------
// INTERFACES
// --------------------------------------------------

export interface ITopAffiliate {
  affiliateId: string;
  name: string;
  earnings: number;
}

export interface ITopProduct {
  productId: string;
  name: string;
  sales: number;
}

export interface ITopCategory {
  categoryId: string;
  name: string;
  sales: number;
}

export interface ILandingPageStats {
  page: string;
  views: number;
}

export interface IAnalytics extends Document {
  date: Date;

  // PERFORMANCE
  totalRevenue: number;
  totalOrders: number;
  totalRefunds: number;
  totalAffiliateEarnings: number;

  // TRAFFIC
  totalVisitors: number;
  newVisitors: number;
  returningVisitors: number;

  // CONVERSION
  cartAbandonRate: number;
  conversionRate: number;

  // TOP LISTS
  topAffiliates: ITopAffiliate[];
  topProducts: ITopProduct[];
  topCategories: ITopCategory[];
  topLandingPages: ILandingPageStats[];

  // DEVICE / PLATFORM
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
  };

  platforms: {
    android: number;
    ios: number;
    windows: number;
    mac: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface IAnalyticsStatics {
  getOrCreate(date?: Date): Promise<IAnalytics>;
  recordOrder(amount: number): Promise<void>;
  recordRefund(amount: number): Promise<void>;
  recordVisit(isNew: boolean, device: string, platform: string): Promise<void>;
  recordAffiliateEarnings(amount: number): Promise<void>;
}

export type AnalyticsModelType = Model<IAnalytics> & IAnalyticsStatics;

// --------------------------------------------------
// SUB-SCHEMAS
// --------------------------------------------------

const topAffiliateSchema = new Schema<ITopAffiliate>(
  {
    affiliateId: { type: String, required: true },
    name: { type: String, required: true },
    earnings: { type: Number, required: true },
  },
  { _id: false }
);

const topProductSchema = new Schema<ITopProduct>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    sales: { type: Number, required: true },
  },
  { _id: false }
);

const topCategorySchema = new Schema<ITopCategory>(
  {
    categoryId: { type: String, required: true },
    name: { type: String, required: true },
    sales: { type: Number, required: true },
  },
  { _id: false }
);

const landingPageSchema = new Schema<ILandingPageStats>(
  {
    page: { type: String, required: true },
    views: { type: Number, required: true },
  },
  { _id: false }
);

// --------------------------------------------------
// MAIN SCHEMA
// --------------------------------------------------

const analyticsSchema = new Schema<IAnalytics, AnalyticsModelType>(
  {
    date: { type: Date, required: true, unique: true },

    // BUSINESS PERFORMANCE
    totalRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalRefunds: { type: Number, default: 0 },
    totalAffiliateEarnings: { type: Number, default: 0 },

    // TRAFFIC
    totalVisitors: { type: Number, default: 0 },
    newVisitors: { type: Number, default: 0 },
    returningVisitors: { type: Number, default: 0 },

    // CONVERSION
    cartAbandonRate: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },

    // TOP LISTS
    topAffiliates: { type: [topAffiliateSchema], default: [] },
    topProducts: { type: [topProductSchema], default: [] },
    topCategories: { type: [topCategorySchema], default: [] },
    topLandingPages: { type: [landingPageSchema], default: [] },

    // DEVICE METRICS
    devices: {
      mobile: { type: Number, default: 0 },
      desktop: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
    },

    // PLATFORM METRICS
    platforms: {
      android: { type: Number, default: 0 },
      ios: { type: Number, default: 0 },
      windows: { type: Number, default: 0 },
      mac: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// --------------------------------------------------
// INDEXES for fast dashboard queries
// --------------------------------------------------

analyticsSchema.index({ date: 1 });
analyticsSchema.index({ totalRevenue: -1 });
analyticsSchema.index({ totalOrders: -1 });
analyticsSchema.index({ totalVisitors: -1 });

// --------------------------------------------------
// STATIC METHODS
// --------------------------------------------------

analyticsSchema.statics.getOrCreate = async function (
  inputDate?: Date
): Promise<IAnalytics> {
  const date = inputDate
    ? new Date(inputDate.toISOString().split("T")[0])
    : new Date(new Date().toISOString().split("T")[0]);

  let record = await this.findOne({ date });

  if (!record) {
    record = await this.create({ date });
  }
  return record;
};

// -------- RECORD ORDER ----------

analyticsSchema.statics.recordOrder = async function (
  amount: number
): Promise<void> {
  const doc = await this.getOrCreate();

  doc.totalOrders += 1;
  doc.totalRevenue += amount;

  await doc.save();
};

// -------- RECORD REFUND ----------

analyticsSchema.statics.recordRefund = async function (
  amount: number
): Promise<void> {
  const doc = await this.getOrCreate();

  doc.totalRefunds += amount;

  await doc.save();
};

// -------- RECORD AFFILIATE EARNINGS ----------

analyticsSchema.statics.recordAffiliateEarnings = async function (
  amount: number
): Promise<void> {
  const doc = await this.getOrCreate();

  doc.totalAffiliateEarnings += amount;

  await doc.save();
};

// -------- RECORD VISIT ----------

analyticsSchema.statics.recordVisit = async function (
  isNew: boolean,
  device: string,
  platform: string
): Promise<void> {
  const doc = await this.getOrCreate();

  // visitor count
  doc.totalVisitors += 1;
  if (isNew) doc.newVisitors += 1;
  else doc.returningVisitors += 1;

  // device
  if (doc.devices[device as keyof typeof doc.devices] !== undefined) {
    doc.devices[device as keyof typeof doc.devices] += 1;
  }

  // platform
  if (doc.platforms[platform as keyof typeof doc.platforms] !== undefined) {
    doc.platforms[platform as keyof typeof doc.platforms] += 1;
  }

  await doc.save();
};

// --------------------------------------------------
// EXPORT MODEL
// --------------------------------------------------

export const Analytics =
  (models.Analytics as AnalyticsModelType) ||
  model<IAnalytics, AnalyticsModelType>("Analytics", analyticsSchema);

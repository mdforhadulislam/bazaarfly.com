// src/server/models/Notification.model.ts
import { Document, Model, Schema, Types, model } from "mongoose";

/**
 * @enum NotificationType
 * সম্ভাব্য সব নোটিফিকেশনের ধরন।
 */
export enum NotificationType {
  // --- ই-কমার্স ---
  ORDER_UPDATE = "order_update",
  PAYMENT_SUCCESS = "payment_success",
  PAYMENT_FAILED = "payment_failed",
  AFFILIATE_COMMISSION_CREDITED = "affiliate_commission_credited",
  AFFILIATE_PAYOUT_PROCESSED = "affiliate_payout_processed",
  PROMOTIONAL_OFFER = "promotional_offer",
  PRODUCT_RESTOCKED = "product_restocked",

  SYSTEM_ANNOUNCEMENT = "system_announcement",
  WELCOME_MESSAGE = "welcome_message",
  SECURITY_ALERT = "security_alert",
}

/**
 * @interface INotification
 * একটি নোটিফিকেশন ডকুমেন্টের জন্য ইন্টারফেস।
 */
export interface INotification extends Document {
  // যে ইউজারের জন্য নোটিফিকেশন (null হলে সবার জন্য)
  recipient: Types.ObjectId | null;

  // নোটিফিকেশনের ধরন
  type: NotificationType;

  // নোটিফিকেশনের বিষয়বস্তু
  title: string;
  message: string;

  // অ্যাপের ভিতরে কোনো পেজে নিয়ে যাওয়ার জন্য লিঙ্ক
  clickAction?: {
    url: string;
    // বাহ্যিক লিঙ্ক না অভ্যন্তরীণ রাউট
    external: boolean;
  };

  // সম্পর্কিত ডকুমেন্ট (যেমন: Order, Product, Booking)
  relatedEntity?: {
    id: Types.ObjectId;
    model: "Order" | "Product" | "User" | "Booking" | "Affiliate"; // আরও যোগ করা যেতে পারে
  };

  // নোটিফিকেশন পাঠানোর মাধ্যমসমূহ
  channels: ("in_app" | "email" | "push" | "sms")[];

  // স্ট্যাটাস
  isRead: boolean;
  readAt?: Date;

  // নোটিফিকেশনের মেয়াদ শেষ হওয়ার তারিখ (ঐচ্ছিক)
  expiresAt?: Date;

  // --- ইনস্ট্যান্স মেথড ---
  markAsRead(): Promise<void>;
}

/**
 * @interface INotificationModel
 * নোটিফিকেশন মডেলের জন্য ইন্টারফেস, স্ট্যাটিক মেথড সহ।
 */
export interface INotificationModel extends Model<INotification> {
  /**
   * একটি নতুন নোটিফিকেশন তৈরি এবং সেভ করার জন্য হেলপার মেথড।
   */
  createNotification(data: Partial<INotification>): Promise<INotification>;
}

// --- সম্পর্কিত ডকুমেন্টের জন্য সাব-স্কিমা ---
const relatedEntitySchema = new Schema(
  {
    id: { type: Schema.Types.ObjectId, required: true },
    model: { type: String, required: true },
  },
  { _id: false }
);

// --- ক্লিক অ্যাকশনের জন্য সাব-স্কিমা ---
const clickActionSchema = new Schema(
  {
    url: { type: String, required: true },
    external: { type: Boolean, default: false },
  },
  { _id: false }
);

// --- নোটিফিকেশন স্কিমা ---
const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null, // null হলে এটি একটি ব্রডকাস্ট
      index: true, // দ্রুত কোয়েরির জন্য ইনডেক্স
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    clickAction: clickActionSchema,
    relatedEntity: relatedEntitySchema,
    channels: [
      {
        type: String,
        enum: ["in_app", "email", "push", "sms"],
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
      index: true, // অপঠিত নোটিফিকেশন খুঁজতে সাহায্য করে
    },
    readAt: { type: Date },
    expiresAt: { type: Date },
  },
  {
    timestamps: true, // createdAt এবং updatedAt স্বয়ংক্রিয়ভাবে যোগ হবে
  }
);

// --- ইনডেক্স ফর পারফরম্যান্স ---
// টাইপ এবং তৈরির তারিখ অনুযায়ী সাজানোর জন্য
notificationSchema.index({ type: 1, createdAt: -1 });
// একজন ইউজারের অপঠিত নোটিফিকেশন খুঁজতে
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
// মেয়াদোত্তীর্ণ নোটিফিকেশন সরানোর জন্য TTL ইনডেক্স
notificationSchema.index({ expiresAt: 1 });

// --- ইনস্ট্যান্স মেথড ---
/**
 * নোটিফিকেশনটিকে পঠিত হিসেবে চিহ্নিত করে।
 */
notificationSchema.methods.markAsRead = async function (): Promise<void> {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  }
};

// --- স্ট্যাটিক মেথড ---
/**
 * একটি নতুন নোটিফিকেশন তৈরি এবং সেভ করার জন্য হেলপার মেথড।
 */
notificationSchema.statics.createNotification = async function (
  data: Partial<INotification>
): Promise<INotification> {
  const notification = new this(data);
  return await notification.save();
};

// --- মডেল এক্সপোর্ট ---
export const Notification = model<INotification, INotificationModel>(
  "Notification",
  notificationSchema
);

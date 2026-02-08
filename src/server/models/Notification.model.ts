import {
  Schema,
  model,
  Document,
  Model,
  Types,
  models,
} from "mongoose";

// ------------------------------------------------------
// MASSIVE ENUM (FULL SYSTEM NOTIFICATION TYPES)
// ------------------------------------------------------

export enum NotificationType {
  // --- E-commerce: Order ---
  ORDER_PLACED = "order_placed",
  ORDER_CONFIRMED = "order_confirmed",
  ORDER_PROCESSING = "order_processing",
  ORDER_SHIPPED = "order_shipped",
  ORDER_DELIVERED = "order_delivered",
  ORDER_CANCELLED = "order_cancelled",
  ORDER_RETURN_REQUESTED = "order_return_requested",
  ORDER_RETURN_APPROVED = "order_return_approved",
  ORDER_RETURN_REJECTED = "order_return_rejected",

  // --- Payments ---
  PAYMENT_PENDING = "payment_pending",
  PAYMENT_SUCCESS = "payment_success",
  PAYMENT_FAILED = "payment_failed",
  PAYMENT_REFUNDED = "payment_refunded",

  // --- Product Stock ---
  PRODUCT_RESTOCKED = "product_restocked",
  PRODUCT_LOW_STOCK = "product_low_stock",
  PRODUCT_OUT_OF_STOCK = "product_out_of_stock",

  // --- Affiliate System ---
  AFFILIATE_APPLICATION_SUBMITTED = "affiliate_application_submitted",
  AFFILIATE_APPLICATION_APPROVED = "affiliate_application_approved",
  AFFILIATE_APPLICATION_REJECTED = "affiliate_application_rejected",

  AFFILIATE_LINK_CREATED = "affiliate_link_created",
  AFFILIATE_LINK_DEACTIVATED = "affiliate_link_deactivated",

  AFFILIATE_COMMISSION_PENDING = "affiliate_commission_pending",
  AFFILIATE_COMMISSION_CONFIRMED = "affiliate_commission_confirmed",
  AFFILIATE_CONVERSION_RECORDED = "affiliate_conversion_recorded",

  AFFILIATE_PAYOUT_REQUESTED = "affiliate_payout_requested",
  AFFILIATE_PAYOUT_COMPLETED = "affiliate_payout_completed",
  AFFILIATE_PAYOUT_REJECTED = "affiliate_payout_rejected",

  // --- Wallet ---
  WALLET_FUNDS_ADDED = "wallet_funds_added",
  WALLET_FUNDS_HELD = "wallet_funds_held",
  WALLET_FUNDS_RELEASED = "wallet_funds_released",
  WALLET_PAYOUT_PROCESSED = "wallet_payout_processed",
  WALLET_PAYOUT_FAILED = "wallet_payout_failed",

  // --- User Account ---
  USER_REGISTERED = "user_registered",
  USER_EMAIL_VERIFIED = "user_email_verified",
  USER_PASSWORD_CHANGED = "user_password_changed",
  USER_PASSWORD_RESET_REQUEST = "user_password_reset_request",
  USER_ACCOUNT_DELETED = "user_account_deleted",
  USER_ACCOUNT_SUSPENDED = "user_account_suspended",
  USER_ACCOUNT_RESTORED = "user_account_restored",

  // --- Security ---
  SECURITY_ALERT = "security_alert",
  LOGIN_FROM_NEW_DEVICE = "login_from_new_device",
  LOGIN_BLOCKED = "login_blocked",
  TWO_FACTOR_CODE = "two_factor_code",

  // --- Admin / System ---
  ADMIN_MESSAGE = "admin_message",
  BROADCAST_MESSAGE = "broadcast_message",
  SYSTEM_ANNOUNCEMENT = "system_announcement",
  SYSTEM_MAINTENANCE = "system_maintenance",
  SYSTEM_UPDATE = "system_update",

  // --- Marketing ---
  PROMOTIONAL_OFFER = "promotional_offer",
  NEW_PRODUCT_LAUNCHED = "new_product_launched",
  FLASH_SALE = "flash_sale",
  COUPON_CODE = "coupon_code",
  DISCOUNT_AVAILABLE = "discount_available",
}

// ------------------------------------------------------
// INTERFACES
// ------------------------------------------------------

export interface IClickAction {
  url: string;
  external: boolean;
}

export interface IRelatedEntity {
  id: Types.ObjectId;
  model: "Order" | "Product" | "User" | "Affiliate" | "Booking";
}

export interface INotification extends Document {
  recipient: Types.ObjectId | null;
  type: NotificationType;

  title: string;
  message: string;

  clickAction?: IClickAction;
  relatedEntity?: IRelatedEntity;

  channels: Array<"in_app" | "email" | "push" | "sms">;

  isRead: boolean;
  readAt?: Date;

  expiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;

  // Instance Methods
  markAsRead(): Promise<void>;
}

export interface INotificationMethods {
  markAsRead(): Promise<void>;
}

export interface INotificationStatics {
  createNotification(
    data: Omit<INotification, keyof Document>
  ): Promise<INotification>;
}

export type NotificationModelType = Model<
  INotification,
  Record<string, never>,
  INotificationMethods
> &
  INotificationStatics;

// ------------------------------------------------------
// SUB-SCHEMAS
// ------------------------------------------------------

const clickActionSchema = new Schema<IClickAction>(
  {
    url: { type: String, required: true },
    external: { type: Boolean, default: false },
  },
  { _id: false }
);

const relatedEntitySchema = new Schema<IRelatedEntity>(
  {
    id: { type: Schema.Types.ObjectId, required: true },
    model: { type: String, required: true },
  },
  { _id: false }
);

// ------------------------------------------------------
// MAIN SCHEMA
// ------------------------------------------------------

const notificationSchema = new Schema<
  INotification,
  NotificationModelType,
  INotificationMethods
>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
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
        required: true,
      },
    ],

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: { type: Date },

    // TTL auto-delete
    expiresAt: { type: Date, index: { expires: 0 } },
  },
  { timestamps: true }
);

// ------------------------------------------------------
// INDEXES
// ------------------------------------------------------

notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// ------------------------------------------------------
// INSTANCE METHOD
// ------------------------------------------------------

notificationSchema.methods.markAsRead = async function (): Promise<void> {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  }
};

// ------------------------------------------------------
// STATIC METHOD
// ------------------------------------------------------

notificationSchema.statics.createNotification = async function (
  data
): Promise<INotification> {
  const doc = new this(data);
  return await doc.save();
};

// ------------------------------------------------------
// EXPORT MODEL
// ------------------------------------------------------

export const Notification =
  (models.Notification as NotificationModelType) ||
  model<INotification, NotificationModelType>(
    "Notification",
    notificationSchema
  );

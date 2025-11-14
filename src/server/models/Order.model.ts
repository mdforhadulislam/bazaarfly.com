import {
  Schema,
  model,
  Document,
  Types,
  Model,
  models,
} from "mongoose";

// ------------------------------------------------------
// ENUMS
// ------------------------------------------------------

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

// ------------------------------------------------------
// INTERFACES
// ------------------------------------------------------

export interface IOrderItem {
  product: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  orderNumber: string;

  // --- Affiliate Tracking ---
  affiliate?: Types.ObjectId | null;
  link?: Types.ObjectId | null;
  affiliateCommission: number;

  // --- Items ---
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;

  shippingAddress: Types.ObjectId;

  status: OrderStatus;
  paymentStatus: PaymentStatus;

  note?: string;
  customerPhone: string;

  createdAt: Date;
  updatedAt: Date;
}

// No instance methods → no empty interface needed
export type OrderModelType = Model<IOrder, Record<string, never>>;

// ------------------------------------------------------
// ORDER ITEM SCHEMA
// ------------------------------------------------------

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

// ------------------------------------------------------
// MAIN ORDER SCHEMA
// ------------------------------------------------------

const orderSchema = new Schema<IOrder, OrderModelType>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    affiliate: {
      type: Schema.Types.ObjectId,
      ref: "Affiliate",
      default: null,
    },

    link: {
      type: Schema.Types.ObjectId,
      ref: "Link",
      default: null,
    },

    affiliateCommission: {
      type: Number,
      default: 0,
      min: 0,
    },

    items: {
      type: [orderItemSchema],
      required: true,
    },

    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    shippingAddress: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },

    note: { type: String },
    customerPhone: { type: String, required: true },
  },
  { timestamps: true }
);

// ------------------------------------------------------
// INDEXES
// ------------------------------------------------------

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ affiliate: 1 });
orderSchema.index({ status: 1 });

// ------------------------------------------------------
// PRE-SAVE — AUTO ORDER NUMBER
// ------------------------------------------------------

orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    const count = await (this.constructor as OrderModelType).countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

// ------------------------------------------------------
// POST-SAVE — AUTO COMMISSION & WALLET LOGIC
// ------------------------------------------------------

orderSchema.post("save", async function (doc) {
  const delivered =
    doc.status === OrderStatus.DELIVERED &&
    doc.affiliate &&
    doc.affiliateCommission > 0;

  if (!delivered) return;

  // Dynamic import to avoid circular dependency
  const { Wallet } = await import("./Wallet.model");
  const { Affiliate } = await import("./Affiliate.model");
  const { Link } = await import("./Link.model");

  // Add held commission
  const affiliateId = doc.affiliate!; // narrowed by `delivered` check above
  const wallet = await Wallet.findByAffiliate(affiliateId);

  if (wallet) {
    await wallet.addHeldCommission(doc.affiliateCommission, doc._id as Types.ObjectId);
  }

  // Affiliate stats update
  await Affiliate.findByIdAndUpdate(affiliateId, {
    $inc: { totalConversions: 1, totalEarnings: doc.affiliateCommission },
  });

  // Conversion count update
  if (doc.link) {
    await Link.findByIdAndUpdate(doc.link, { $inc: { conversions: 1 } });
  }
});

// ------------------------------------------------------
// EXPORT MODEL
// ------------------------------------------------------

export const Order =
  (models.Order as OrderModelType) ||
  model<IOrder, OrderModelType>("Order", orderSchema);

// src/server/models/Order.model.ts
import { Document, Schema, Types, model } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  orderNumber: string;

  // --- অ্যাফিলিয়েট ট্র্যাকিং ---
  affiliate?: Types.ObjectId;
  link?: Types.ObjectId; // কোন লিঙ্ক থেকে অর্ডার এসেছে
  affiliateCommission: number; // এই অর্ডারের জন্য মোট কমিশন

  // --- অর্ডার ডিটেইলস ---
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  shippingAddress: Types.ObjectId;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  note?: string;
  customerPhone: string;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, required: true, unique: true },
    affiliate: { type: Schema.Types.ObjectId, ref: "Affiliate" },
    link: { type: Schema.Types.ObjectId, ref: "Link" },
    affiliateCommission: { type: Number, default: 0 },
    items: [orderItemSchema],
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
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    note: { type: String },
    customerPhone: { type: String, required: true },
  },
  { timestamps: true }
);

// অর্ডার নম্বর জেনারেট করার মিডলওয়্যার
orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(5, "0")}`;
  }
  next();
});

// অর্ডার ডেলিভার হলে স্বয়ংক্রিয়ভাবে কমিশন যোগ করার মিডলওয়্যার
orderSchema.post("save", async function (doc) {
  if (
    doc.isModified("status") &&
    doc.status === "delivered" &&
    doc.affiliate &&
    doc.affiliateCommission > 0
  ) {
    const { Wallet } = await import("./Wallet.model");
    const { Affiliate } = await import("./Affiliate.model");
    const { Link } = await import("./Link.model");

    const wallet = await Wallet.findByAffiliate(doc.affiliate);
    if (wallet) {
      await wallet.addHeldCommission(doc.affiliateCommission, doc._id);
      console.log(
        `Commission of ${doc.affiliateCommission} held for affiliate ${doc.affiliate}`
      );
    }
    // অ্যাফিলিয়েট এবং লিঙ্কের কনভার্সন কাউন্টার আপডেট করুন
    await Affiliate.findByIdAndUpdate(doc.affiliate, {
      $inc: { totalConversions: 1, totalEarnings: doc.affiliateCommission },
    });
    if (doc.link) {
      await Link.findByIdAndUpdate(doc.link, { $inc: { conversions: 1 } });
    }
  }
});

export const Order = model<IOrder>("Order", orderSchema);

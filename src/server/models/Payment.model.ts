// src/server/models/Payment.model.ts
import { Document, Schema, Types, model } from "mongoose";

export interface IPayment extends Document {
  order: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  method: "bkash" | "nagad" | "rocket" | "upay" | "bank_transfer" | "cod";
  status: "pending" | "paid" | "failed" | "refunded";
  transactionId?: string;
  gatewayResponse?: object;
}

const paymentSchema = new Schema<IPayment>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ["bkash", "nagad", "rocket", "upay", "bank_transfer", "cod"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    transactionId: { type: String, sparse: true },
    gatewayResponse: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Payment = model<IPayment>("Payment", paymentSchema);

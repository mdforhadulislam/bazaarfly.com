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

export enum PaymentMethod {
  BKASH = "bkash",
  NAGAD = "nagad",
  ROCKET = "rocket",
  UPAY = "upay",
  BANK_TRANSFER = "bank_transfer",
  COD = "cod",
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

export interface IGatewayResponse {
  trxId?: string;
  senderNumber?: string;
  reference?: string;
  raw?: Record<string, never>;
}

export interface IPayment extends Document {
  order: Types.ObjectId;
  user: Types.ObjectId;

  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;

  transactionId?: string;
  gatewayResponse?: IGatewayResponse;

  createdAt: Date;
  updatedAt: Date;
}

export type PaymentModelType = Model<IPayment, Record<string, never>>;

// ------------------------------------------------------
// SCHEMA
// ------------------------------------------------------

const paymentSchema = new Schema<IPayment, PaymentModelType>(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    method: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },

    transactionId: {
      type: String,
      sparse: true,
      trim: true,
    },

    gatewayResponse: {
      type: Schema.Types.Mixed, // safe for raw gateway data
    },
  },
  { timestamps: true }
);

// ------------------------------------------------------
// INDEXES
// ------------------------------------------------------

paymentSchema.index({ method: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

// ------------------------------------------------------
// EXPORT MODEL
// ------------------------------------------------------

export const Payment =
  (models.Payment as PaymentModelType) ||
  model<IPayment, PaymentModelType>("Payment", paymentSchema);

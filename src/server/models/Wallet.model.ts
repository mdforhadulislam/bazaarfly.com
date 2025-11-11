// src/server/models/Wallet.model.ts
import { Document, Model, Schema, Types, model } from "mongoose";

export enum TransactionType {
  COMMISSION = "commission",
  PAYOUT = "payout",
  BONUS = "bonus",
  ADJUSTMENT = "adjustment",
}
export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface IWalletTransaction {
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  description: string;
  relatedId?: Types.ObjectId;
  runningBalance: number;
  createdAt: Date;
  processedAt?: Date;
}
export interface IWallet extends Document {
  affiliate: Types.ObjectId;
  availableBalance: number;
  heldBalance: number;
  totalEarnings: number;
  totalPayouts: number;
  transactions: IWalletTransaction[];
  addTransaction(
    type: TransactionType,
    amount: number,
    description: string,
    status?: TransactionStatus,
    relatedId?: Types.ObjectId
  ): Promise<IWalletTransaction>;
  addHeldCommission(
    amount: number,
    orderId: Types.ObjectId
  ): Promise<IWalletTransaction>;
  releaseHeldFunds(orderId: Types.ObjectId): Promise<void>;
}
export interface IWalletModel extends Model<IWallet> {
  findByAffiliate(affiliateId: Types.ObjectId): Promise<IWallet | null>;
}

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.COMPLETED,
    },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    relatedId: { type: Schema.Types.ObjectId },
    runningBalance: { type: Number, required: true },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

const walletSchema = new Schema<IWallet>(
  {
    affiliate: {
      type: Schema.Types.ObjectId,
      ref: "Affiliate",
      required: true,
      unique: true,
    },
    availableBalance: { type: Number, default: 0, min: 0 },
    heldBalance: { type: Number, default: 0, min: 0 },
    totalEarnings: { type: Number, default: 0, min: 0 },
    totalPayouts: { type: Number, default: 0, min: 0 },
    transactions: [walletTransactionSchema],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

walletSchema.virtual("totalBalance").get(function (this: IWallet) {
  return this.availableBalance + this.heldBalance;
});
walletSchema.index({ affiliate: 1 });
walletSchema.index({ "transactions.status": 1 });
walletSchema.index({ "transactions.createdAt": -1 });

walletSchema.methods.addTransaction = async function (
  type: TransactionType,
  amount: number,
  description: string,
  status: TransactionStatus = TransactionStatus.COMPLETED,
  relatedId?: Types.ObjectId
): Promise<IWalletTransaction> {
  if (amount <= 0) throw new Error("Transaction amount must be positive.");
  let newAvailableBalance = this.availableBalance,
    newHeldBalance = this.heldBalance,
    newTotalEarnings = this.totalEarnings,
    newTotalPayouts = this.totalPayouts;
  if (type === TransactionType.COMMISSION) {
    newTotalEarnings += amount;
    if (status === TransactionStatus.COMPLETED) newAvailableBalance += amount;
    else if (status === TransactionStatus.PENDING) newHeldBalance += amount;
  } else if (type === TransactionType.PAYOUT) {
    if (this.availableBalance < amount)
      throw new Error("Insufficient available balance for payout.");
    newAvailableBalance -= amount;
    newTotalPayouts += amount;
  }
  const runningBalance = newAvailableBalance + newHeldBalance;
  const transaction = {
    type,
    status,
    amount,
    description,
    relatedId,
    runningBalance ,
  };
  this.transactions.push(transaction);
  this.availableBalance = newAvailableBalance;
  this.heldBalance = newHeldBalance;
  this.totalEarnings = newTotalEarnings;
  this.totalPayouts = newTotalPayouts;
  await this.save();
  return this.transactions[this.transactions.length - 1];
};
walletSchema.methods.addHeldCommission = async function (
  amount: number,
  orderId: Types.ObjectId
) {
  return this.addTransaction(
    TransactionType.COMMISSION,
    amount,
    `Commission from Order #${orderId}`,
    TransactionStatus.PENDING,
    orderId
  );
};
walletSchema.methods.releaseHeldFunds = async function (
  orderId: Types.ObjectId
) {
  const pendingTransaction = this.transactions.find(
    (t) =>
      t.relatedId?.equals(orderId) && t.status === TransactionStatus.PENDING
  );
  if (!pendingTransaction) return;
  pendingTransaction.status = TransactionStatus.COMPLETED;
  pendingTransaction.processedAt = new Date();
  this.heldBalance -= pendingTransaction.amount;
  this.availableBalance += pendingTransaction.amount;
  let currentBalance = this.availableBalance + this.heldBalance;
  for (let i = this.transactions.length - 1; i >= 0; i--) {
    this.transactions[i].runningBalance = currentBalance;
    if (this.transactions[i].type === TransactionType.PAYOUT)
      currentBalance += this.transactions[i].amount;
    else currentBalance -= this.transactions[i].amount;
  }
  await this.save();
};
walletSchema.statics.findByAffiliate = function (affiliateId: Types.ObjectId) {
  return this.findOne({ affiliate: affiliateId });
};

export const Wallet = model<IWallet, IWalletModel>("Wallet", walletSchema);

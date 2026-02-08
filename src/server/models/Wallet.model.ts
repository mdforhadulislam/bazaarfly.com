import {
  Schema,
  model,
  Document,
  Model,
  Types,
  models,
} from "mongoose";

// ------------------------------------------------------
// ENUMS
// ------------------------------------------------------

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

// ------------------------------------------------------
// INTERFACES
// ------------------------------------------------------

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

  createdAt: Date;
  updatedAt: Date;
}

// ------------------------------------------------------
// STATIC METHODS INTERFACE
// ------------------------------------------------------

export interface IWalletStatics {
  findByAffiliate(affiliateId: Types.ObjectId): Promise<IWallet | null>;
}

// ------------------------------------------------------
// MODEL TYPE
// ------------------------------------------------------

export type WalletModelType = Model<
  IWallet,
  Record<string, never>,
  Record<string, never>,
  IWalletStatics
>;

// ------------------------------------------------------
// TRANSACTION SUB-SCHEMA
// ------------------------------------------------------

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

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    relatedId: {
      type: Schema.Types.ObjectId,
    },

    runningBalance: {
      type: Number,
      required: true,
    },

    processedAt: {
      type: Date,
    },
  },
  { timestamps: true, _id: false }
);

// ------------------------------------------------------
// MAIN WALLET SCHEMA
// ------------------------------------------------------

const walletSchema = new Schema<IWallet, WalletModelType>(
  {
    affiliate: {
      type: Schema.Types.ObjectId,
      ref: "Affiliate",
      required: true,
      unique: true,
      index: true,
    },

    availableBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    heldBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalPayouts: {
      type: Number,
      default: 0,
      min: 0,
    },

    transactions: [walletTransactionSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ------------------------------------------------------
// VIRTUALS
// ------------------------------------------------------

walletSchema.virtual("totalBalance").get(function (this: IWallet) {
  return this.availableBalance + this.heldBalance;
});

// ------------------------------------------------------
// INDEXES
// ------------------------------------------------------

walletSchema.index({ affiliate: 1 });
walletSchema.index({ "transactions.status": 1 });
walletSchema.index({ "transactions.createdAt": -1 });

// ------------------------------------------------------
// INSTANCE METHODS
// ------------------------------------------------------

walletSchema.methods.addTransaction = async function (
  type: TransactionType,
  amount: number,
  description: string,
  status: TransactionStatus = TransactionStatus.COMPLETED,
  relatedId?: Types.ObjectId
): Promise<IWalletTransaction> {
  if (amount <= 0) throw new Error("Transaction amount must be positive");

  let available = this.availableBalance;
  let held = this.heldBalance;
  let earnings = this.totalEarnings;
  let payouts = this.totalPayouts;

  if (type === TransactionType.COMMISSION) {
    earnings += amount;

    if (status === TransactionStatus.PENDING) held += amount;
    else available += amount;
  }

  if (type === TransactionType.PAYOUT) {
    if (available < amount) throw new Error("Insufficient balance");

    available -= amount;
    payouts += amount;
  }

  const runningBalance = available + held;

  const transaction: IWalletTransaction = {
    type,
    status,
    amount,
    description,
    relatedId,
    runningBalance,
    createdAt: new Date(),
  };

  this.transactions.push(transaction);

  this.availableBalance = available;
  this.heldBalance = held;
  this.totalEarnings = earnings;
  this.totalPayouts = payouts;

  await this.save();
  return transaction;
};

walletSchema.methods.addHeldCommission = async function (
  amount: number,
  orderId: Types.ObjectId
) {
  return this.addTransaction(
    TransactionType.COMMISSION,
    amount,
    `Commission from Order #${orderId.toString()}`,
    TransactionStatus.PENDING,
    orderId
  );
};

walletSchema.methods.releaseHeldFunds = async function (
  orderId: Types.ObjectId
): Promise<void> {
  const tx = this.transactions.find(
    (t: IWalletTransaction) =>
      t.relatedId?.toString() === orderId.toString() &&
      t.status === TransactionStatus.PENDING
  );

  if (!tx) return;

  tx.status = TransactionStatus.COMPLETED;
  tx.processedAt = new Date();

  this.heldBalance -= tx.amount;
  this.availableBalance += tx.amount;

  let balance = this.availableBalance + this.heldBalance;

  for (let i = this.transactions.length - 1; i >= 0; i--) {
    const transaction = this.transactions[i] as IWalletTransaction;

    transaction.runningBalance = balance;

    if (transaction.type === TransactionType.PAYOUT) {
      balance += transaction.amount;
    } else {
      balance -= transaction.amount;
    }
  }

  await this.save();
};

// ------------------------------------------------------
// STATIC METHOD IMPLEMENTATION
// ------------------------------------------------------

walletSchema.statics.findByAffiliate = function (
  affiliateId: Types.ObjectId
) {
  return this.findOne({ affiliate: affiliateId });
};

// ------------------------------------------------------
// EXPORT MODEL
// ------------------------------------------------------

export const Wallet =
  (models.Wallet as WalletModelType) ||
  model<IWallet, WalletModelType>("Wallet", walletSchema);

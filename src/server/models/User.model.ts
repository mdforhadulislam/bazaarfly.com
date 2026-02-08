import {
  Schema,
  model,
  Document,
  Model,
  Types,
  models,
  Query,
} from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// ------------------------------------------------------
// INTERFACES
// ------------------------------------------------------

export interface IUserPreferences {
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    sms: boolean;
    marketing: boolean;
  };
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;

  avatar?: string;
  role: "user" | "affiliate" | "admin";

  addresses: Types.ObjectId[];
  isEmailVerified: boolean;

  dateOfBirth?: Date;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";

  preferences: IUserPreferences;

  wishlist: Types.ObjectId[];

  hasAcceptedMarketing: boolean;
  source?: string;
  notes?: string;

  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  loginAttempts: number;
  lockUntil?: Date;

  lastLogin?: Date;
  lastLoginIP?: string;

  isDeleted: boolean;
  deletedAt?: Date;

  // instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  setNewPassword(newPassword: string): Promise<void>;
  generatePasswordResetToken(): string;
  generateEmailVerificationToken(): string;
}

// ------------------------------------------------------
// STATIC METHODS INTERFACE
// ------------------------------------------------------

export interface IUserStatics {
  findByIdentifier(identifier: string): Promise<IUser | null>;
}

// Combine model types
export type UserModelType = Model<IUser> & IUserStatics;

// ------------------------------------------------------
// PREFERENCE SCHEMA
// ------------------------------------------------------

const preferencesSchema = new Schema<IUserPreferences>({
  language: { type: String, default: "en" },
  currency: { type: String, default: "USD" },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false },
  },
});

// ------------------------------------------------------
// USER SCHEMA
// ------------------------------------------------------

const userSchema = new Schema<IUser, UserModelType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Invalid email format",
      ],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Invalid phone number"],
    },

    avatar: String,

    role: {
      type: String,
      enum: ["user", "affiliate", "admin"],
      default: "user",
    },

    addresses: [{ type: Schema.Types.ObjectId, ref: "Address" }],

    isEmailVerified: { type: Boolean, default: false },

    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },

    preferences: { type: preferencesSchema, default: () => ({}) },

    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],

    hasAcceptedMarketing: { type: Boolean, default: false },
    source: String,
    notes: String,

    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,

    lastLogin: Date,
    lastLoginIP: String,

    isDeleted: { type: Boolean, default: false, select: false },
    deletedAt: { type: Date, select: false },
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

userSchema.virtual("isLocked").get(function () {
  return Boolean(this.lockUntil && this.lockUntil > new Date());
});

// ------------------------------------------------------
// MIDDLEWARE — SOFT DELETE
// ------------------------------------------------------

userSchema.pre(/^find/, function (this: Query<IUser, IUser>, next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

// ------------------------------------------------------
// PRE-SAVE PASSWORD HASHING
// ------------------------------------------------------

const SALT_ROUNDS = 12;

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  next();
});

// ------------------------------------------------------
// INSTANCE METHODS
// ------------------------------------------------------

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    const UserModel = this.constructor as UserModelType;
    const user = await UserModel.findById(this._id).select("+password");
    if (!user?.password) return false;
    return bcrypt.compare(candidatePassword, user.password);
  }
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.setNewPassword = async function (
  newPassword: string
): Promise<void> {
  this.password = newPassword;
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
  await this.save();
};

userSchema.methods.generatePasswordResetToken = function (): string {
  const token = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  return token;
};

userSchema.methods.generateEmailVerificationToken = function (): string {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return token;
};

// ------------------------------------------------------
// STATIC METHODS (FINAL FIX — ZERO ERROR)
// ------------------------------------------------------

userSchema.statics.findByIdentifier = function (
  identifier: string
): Promise<IUser | null> {
  return this.findOne({
    $or: [{ email: identifier }, { phoneNumber: identifier }],
  });
};

// ------------------------------------------------------
// EXPORT MODEL
// ------------------------------------------------------

export const User =
  (models.User as UserModelType) ||
  model<IUser, UserModelType>("User", userSchema);

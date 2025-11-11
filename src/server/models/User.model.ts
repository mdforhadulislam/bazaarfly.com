// src/server/models/User.model.ts
import { Schema, model, Document, Types, Model, Query, models } from 'mongoose'; // Import Query
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// --- Interfaces ---

/**
 * @interface IUserPreferences
 * User-specific preferences for personalization.
 */
interface IUserPreferences {
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    sms: boolean;
    marketing: boolean;
  };
}

/**
 * @interface IUser
 * Represents a User document in the database.
 */
export interface IUser extends Document {
  name: string;
  email: string;
  password: string; // Hashed password
  phoneNumber: string;
  avatar?: string;
  role: 'user' | 'affiliate' | 'admin';
  addresses: Types.ObjectId[];
  isEmailVerified: boolean;

  // --- Profile & Personalization ---
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  preferences: IUserPreferences;
  wishlist: Types.ObjectId[]; // Array of Product IDs

  // --- Marketing & Analytics ---
  hasAcceptedMarketing: boolean; // GDPR/CCPA compliance
  source?: string; // e.g., 'google', 'facebook_ad', 'organic'
  notes?: string; // Internal admin notes

  // --- Security & Verification ---
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  // --- Account Security ---
  loginAttempts: number;
  lockUntil?: Date;

  // --- Activity Tracking ---
  lastLogin?: Date;
  lastLoginIP?: string;

  // --- Soft Delete ---
  isDeleted: boolean;
  deletedAt?: Date;

  // --- Instance Methods ---
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordResetToken(): string;
  generateEmailVerificationToken(): string;
  setNewPassword(newPassword: string): Promise<void>;
}
 
interface IUserModel extends Model<IUser> {
  findByIdentifier(identifier: string): Promise<IUser | null>;
}

// --- Schema Definition ---

const userPreferencesSchema = new Schema<IUserPreferences>({
  language: { type: String, default: 'en' },
  currency: { type: String, default: 'USD' },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false },
  },
});

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address.'],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [6, 'Password must be at least 6 characters long.'],
      select: false,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required.'],
      unique: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please fill a valid phone number.'],
    },
    avatar: { type: String },
    role: {
      type: String,
      enum: ['user', 'affiliate', 'admin'],
      default: 'user',
    },
    addresses: [{ type: Schema.Types.ObjectId, ref: 'Address' }],
    isEmailVerified: { type: Boolean, default: false },

    // --- Profile & Personalization ---
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
    preferences: { type: userPreferencesSchema, default: () => ({}) },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],

    // --- Marketing & Analytics ---
    hasAcceptedMarketing: { type: Boolean, default: false },
    source: { type: String },
    notes: { type: String }, // For internal admin use

    // --- Security & Verification ---
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // --- Account Security ---
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    // --- Activity Tracking ---
    lastLogin: Date,
    lastLoginIP: String,

    // --- Soft Delete ---
    isDeleted: { type: Boolean, default: false, select: false },
    deletedAt: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- Virtuals ---
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// --- Indexes ---
userSchema.index({ email: 1, isDeleted: 1 });
userSchema.index({ phoneNumber: 1, isDeleted: 1 });
userSchema.index({ passwordResetToken: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ lockUntil: 1 }, { expireAfterSeconds: 0 });
userSchema.index({ source: 1 });

// --- Middleware ---
// Define salt rounds constant
const SALT_ROUNDS = 12;

userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with defined salt rounds
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// --- FIX IS HERE ---
// Explicitly type `this` as a Mongoose Query
userSchema.pre(/^find/, function (this: Query<any, any>, next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// --- Instance Methods ---
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  // Ensure password is selected for comparison
  if (!this.password) {
    const user = await this.constructor.findById(this._id).select('+password');
    if (!user) return false;
    return bcrypt.compare(candidatePassword, user.password);
  }
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.setNewPassword = async function(newPassword: string): Promise<void> {
  this.password = newPassword; // Will be hashed by pre-save hook
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;
  await this.save();
};

userSchema.methods.generatePasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return resetToken;
};

userSchema.methods.generateEmailVerificationToken = function (): string {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return verificationToken;
}; 
 
userSchema.statics.findByIdentifier = function (identifier: string) {
  return this.findOne({
    $or: [{ email: identifier }, { phoneNumber: identifier }],
  });
};

export const User = models.User || model<IUser, IUserModel>("User", userSchema);
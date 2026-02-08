import { Document, Model, Schema, Types, model, models } from "mongoose";

// --------------------------------------------------
// INTERFACE
// --------------------------------------------------

export interface IAddress extends Document {
  user: Types.ObjectId;

  label: string; // Home / Office / Other
  address: string; // Full street address
  area: string; // Local area or moholla
  city: string; // City or district
  postalCode: string; // ZIP / postal code

  isDefault: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface IAddressStatics {
  findUserDefault(userId: Types.ObjectId): Promise<IAddress | null>;
}

export type AddressModelType = Model<IAddress> & IAddressStatics;

// --------------------------------------------------
// SCHEMA
// --------------------------------------------------

const addressSchema = new Schema<IAddress, AddressModelType>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    area: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    postalCode: {
      type: String,
      required: true,
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// --------------------------------------------------
// INDEXES
// --------------------------------------------------

addressSchema.index({ user: 1, isDefault: 1 });
addressSchema.index({ city: 1 });
addressSchema.index({ postalCode: 1 });

// --------------------------------------------------
// STATIC METHOD
// --------------------------------------------------

addressSchema.statics.findUserDefault = function (
  userId: Types.ObjectId
): Promise<IAddress | null> {
  return this.findOne({ user: userId, isDefault: true });
};

// --------------------------------------------------
// EXPORT MODEL
// --------------------------------------------------

export const Address =
  (models.Address as AddressModelType) ||
  model<IAddress, AddressModelType>("Address", addressSchema);

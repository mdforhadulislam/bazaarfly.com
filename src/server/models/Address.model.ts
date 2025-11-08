// src/server/models/Address.model.ts
import { Schema, model, Document, Types } from 'mongoose';

/**
 * @interface IAddress
 * Represents a shipping or billing address for a user.
 */
export interface IAddress extends Document {
  // Reference to the user who owns this address
  user: Types.ObjectId;

  // A label for the address, e.g., 'Home', 'Office', 'Parents House'
  label: string;

  // Address details
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;

  // Mark this as the default address for the user
  isDefault: boolean;
}

// --- Address Schema ---
const addressSchema = new Schema<IAddress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Address must be associated with a user.'],
      // This index ensures fast lookups of all addresses for a single user
      index: true,
    },
    label: {
      type: String,
      required: [true, 'Please provide a label for the address (e.g., Home).'],
      trim: true,
      maxlength: [50, 'Label cannot exceed 50 characters.'],
    },
    streetAddress: {
      type: String,
      required: [true, 'Street address is required.'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required.'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required.'],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required.'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required.'],
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// --- Export the Model ---
export const Address = model<IAddress>('Address', addressSchema);
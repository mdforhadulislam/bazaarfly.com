// src/server/models/Address.model.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IAddress extends Document {
  user: Types.ObjectId;
  label: string; // যেমন: 'বাড়ি', 'অফিস'
  division: string; // বিভাগ
  district: string; // জেলা
  upazila: string; // উপজেলা
  addressLine: string; // বিস্তারিত ঠিকানা
  postalCode: string;
  isDefault: boolean;
}

const addressSchema = new Schema<IAddress>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  label: { type: String, required: true, trim: true },
  division: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  upazila: { type: String, required: true, trim: true },
  addressLine: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

export const Address = model<IAddress>('Address', addressSchema);
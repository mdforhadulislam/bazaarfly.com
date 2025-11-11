// src/server/models/Banner.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IBanner extends Document {
  title: string; subtitle?: string; image: string; link?: string;
  isActive: boolean; position: 'home_top' | 'home_middle' | 'category_page';
  startDate: Date; endDate: Date;
}

const bannerSchema = new Schema<IBanner>({
  title: { type: String, required: true }, subtitle: { type: String }, image: { type: String, required: true },
  link: { type: String }, isActive: { type: Boolean, default: true },
  position: { type: String, enum: ['home_top', 'home_middle', 'category_page'], default: 'home_top' },
  startDate: { type: Date, required: true }, endDate: { type: Date, required: true },
}, { timestamps: true });

export const Banner = model<IBanner>('Banner', bannerSchema);
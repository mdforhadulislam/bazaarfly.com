// src/server/models/Category.model.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  image?: string;
  parent?: Types.ObjectId;
}

const categorySchema = new Schema<ICategory>({ name: { type: String, required: true, trim: true }, slug: { type: String, required: true, unique: true, lowercase: true }, image: { type: String }, parent: { type: Schema.Types.ObjectId, ref: 'Category' } }, { timestamps: true });
export const Category = model<ICategory>('Category', categorySchema);
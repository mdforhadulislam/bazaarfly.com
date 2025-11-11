// src/server/models/Tag.model.ts
import { Document, Schema, model } from "mongoose";

export interface ITag extends Document {
  name: string;
  slug: string;
}
const tagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
  },
  { timestamps: true }
);
export const Tag = model<ITag>("Tag", tagSchema);

// src/server/models/Popup.model.ts
import { Document, Schema, model } from "mongoose";

export interface IPopup extends Document {
  title: string;
  content: string;
  image?: string;
  isActive: boolean;
  trigger: "onLoad" | "onExit" | "timeDelay";
  triggerValue?: number; // যেমন: সেকেন্ডের জন্য সময় ডিলে
}

const popupSchema = new Schema<IPopup>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    trigger: {
      type: String,
      enum: ["onLoad", "onExit", "timeDelay"],
      required: true,
    },
    triggerValue: { type: Number },
  },
  { timestamps: true }
);

export const Popup = model<IPopup>("Popup", popupSchema);

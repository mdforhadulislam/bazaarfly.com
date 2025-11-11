// src/server/models/Contact.model.ts
import { Document, Schema, model } from "mongoose";

/**
 * @interface IContact
 * Represents a contact form submission from a user.
 */
export interface IContact extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
}

// --- Contact Schema ---
const contactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address.",
      ],
    },
    subject: {
      type: String,
      required: [true, "Subject is required."],
      trim: true,
      maxlength: [255, "Subject cannot exceed 255 characters."],
    },
    message: {
      type: String,
      required: [true, "Message cannot be empty."],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["new", "read", "replied"],
        message: "Status must be either new, read, or replied.",
      },
      default: "new",
    },
  },
  {
    // স্বয়ংক্রিয়ভাবে createdAt এবং updatedAt ফিল্ড যোগ করে
    timestamps: true,
  }
);

// --- Indexes for Performance ---
// অ্যাডমিন যাতে সহজে স্ট্যাটাস অনুযায়ী মেসেজ খুঁজে পায় (যেমন: সব 'new' মেসেজ)
contactSchema.index({ status: 1 });
// তারিখ অনুযায়ী সাজানোর জন্য
contactSchema.index({ createdAt: -1 });

// --- Export the Model ---
export const Contact = model<IContact>("Contact", contactSchema);

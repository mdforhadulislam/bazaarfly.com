import { Schema, model, Document, Model, models } from "mongoose";

// --------------------------------------------------
// INTERFACE
// --------------------------------------------------

export interface IContact extends Document {
  name: string;
  email: string;
  phone?: string;
  message: string;

  status: "pending" | "seen" | "replied";
  adminNote?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface IContactStatics {
  markSeen(id: string): Promise<void>;
  reply(id: string, note: string): Promise<void>;
}

export type ContactModelType = Model<IContact> & IContactStatics;

// --------------------------------------------------
// SCHEMA
// --------------------------------------------------

const contactSchema = new Schema<IContact, ContactModelType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Invalid email address",
      ],
    },

    phone: {
      type: String,
      trim: true,
      match: [/^\+?[0-9]{7,15}$/, "Invalid phone number"],
    },

    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
    },

    status: {
      type: String,
      enum: ["pending", "seen", "replied"],
      default: "pending",
      index: true,
    },

    adminNote: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// --------------------------------------------------
// INDEXES
// --------------------------------------------------

contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });

// --------------------------------------------------
// STATIC METHODS
// --------------------------------------------------

contactSchema.statics.markSeen = async function (id: string): Promise<void> {
  await this.findByIdAndUpdate(id, { status: "seen" });
};

contactSchema.statics.reply = async function (
  id: string,
  note: string
): Promise<void> {
  await this.findByIdAndUpdate(id, {
    status: "replied",
    adminNote: note,
  });
};

// --------------------------------------------------
// EXPORT MODEL
// --------------------------------------------------

export const Contact =
  (models.Contact as ContactModelType) ||
  model<IContact, ContactModelType>("Contact", contactSchema);

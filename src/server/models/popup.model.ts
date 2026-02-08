import {
  Schema,
  model,
  Document,
  Model,
  models,
} from "mongoose";

// ------------------------------------------------------
// ENUMS
// ------------------------------------------------------

export enum PopupTrigger {
  ON_LOAD = "onLoad",
  ON_EXIT = "onExit",
  TIME_DELAY = "timeDelay",
}

export enum PopupType {
  INFO = "info",
  PROMOTION = "promotion",
  DISCOUNT = "discount",
  WARNING = "warning",
  SUBSCRIPTION = "subscription",
}

// ------------------------------------------------------
// INTERFACE
// ------------------------------------------------------

export interface IPopup extends Document {
  title: string;
  content: string;

  image?: string;
  type: PopupType;

  isActive: boolean;

  trigger: PopupTrigger;
  triggerValue?: number;

  startDate?: Date;
  endDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export type PopupModelType = Model<IPopup, Record<string, never>>;

// ------------------------------------------------------
// SCHEMA
// ------------------------------------------------------

const popupSchema = new Schema<IPopup, PopupModelType>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      trim: true,
    },

    type: {
      type: String,
      enum: Object.values(PopupType),
      default: PopupType.INFO,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    trigger: {
      type: String,
      enum: Object.values(PopupTrigger),
      required: true,
      index: true,
    },

    triggerValue: {
      type: Number,
      min: 0,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

// ------------------------------------------------------
// INDEXES
// ------------------------------------------------------

popupSchema.index({ isActive: 1 });
popupSchema.index({ trigger: 1 });
popupSchema.index({ type: 1 });
popupSchema.index({ startDate: 1, endDate: 1 });

// ------------------------------------------------------
// EXPORT
// ------------------------------------------------------

export const Popup =
  (models.Popup as PopupModelType) ||
  model<IPopup, PopupModelType>("Popup", popupSchema);

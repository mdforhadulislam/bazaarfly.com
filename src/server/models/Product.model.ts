import {
  Schema,
  model,
  Document,
  Model,
  Types,
  models,
} from "mongoose";
import slugify from "slugify";

// ------------------------------------------------------
// ENUMS
// ------------------------------------------------------

export enum ProductStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  OUT_OF_STOCK = "out_of_stock",
  DRAFT = "draft",
}

// ------------------------------------------------------
// COLOR VARIANT INTERFACE
// ------------------------------------------------------

export interface IColorVariant {
  name: string;          // e.g., Red, Blue
  hex?: string;          // e.g., #FF0000
  images: string[];      // color-specific images
}

// ------------------------------------------------------
// MAIN PRODUCT INTERFACE
// ------------------------------------------------------

export interface IProduct extends Document {
  name: string;
  slug: string;

  description: string;
  basePrice: number;
  discountPrice?: number;

  sku: string;
  stock: number;

  commissionPercent: number;

  category: Types.ObjectId;
  tags: Types.ObjectId[];

  images: string[];            // default images
  colors?: IColorVariant[];    // color variants
  sizes?: string[];            // e.g., ["S", "M", "L", "XL"]
  weight?: number;             // optional

  status: ProductStatus;

  metaTitle?: string;
  metaDescription?: string;

  finalPrice: number;

  createdAt: Date;
  updatedAt: Date;
}

export type ProductModelType = Model<IProduct, Record<string, never>>;

// ------------------------------------------------------
// COLOR VARIANT SUBSCHEMA
// ------------------------------------------------------

const colorVariantSchema = new Schema<IColorVariant>(
  {
    name: { type: String, required: true, trim: true },
    hex: { type: String }, // optional
    images: [{ type: String, required: true }],
  },
  { _id: false }
);

// ------------------------------------------------------
// PRODUCT SCHEMA
// ------------------------------------------------------

const productSchema = new Schema<IProduct, ProductModelType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      minlength: 10,
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      min: 0,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    commissionPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],

    images: [
      {
        type: String,
        trim: true,
      },
    ],

    sizes: [
      {
        type: String,
        trim: true,
      },
    ],

    colors: [colorVariantSchema], // <-- color-level images

    weight: {
      type: Number,
      min: 0,
    },

    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.DRAFT,
      index: true,
    },

    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ------------------------------------------------------
// VIRTUALS
// ------------------------------------------------------

productSchema.virtual("finalPrice").get(function (this: IProduct) {
  if (this.discountPrice && this.discountPrice < this.basePrice) {
    return this.discountPrice;
  }
  return this.basePrice;
});

// ------------------------------------------------------
// INDEXES
// ------------------------------------------------------

productSchema.index({ name: "text", description: "text" });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ commissionPercent: -1 });

// ------------------------------------------------------
// PRE-SAVE — AUTO SLUG
// ------------------------------------------------------

productSchema.pre("save", async function (next) {
  if (!this.slug) {
    const baseSlug = slugify(this.name, { lower: true, strict: true });
    let uniqueSlug = baseSlug;
    let counter = 2;

    const existing = await (this.constructor as ProductModelType).findOne({
      slug: uniqueSlug,
    });

    if (existing) {
      while (
        await (this.constructor as ProductModelType).findOne({
          slug: `${baseSlug}-${counter}`,
        })
      ) {
        counter += 1;
      }
      uniqueSlug = `${baseSlug}-${counter}`;
    }

    this.slug = uniqueSlug;
  }
  next();
});

// ------------------------------------------------------
// EXPORT
// ------------------------------------------------------

export const Product =
  (models.Product as ProductModelType) ||
  model<IProduct, ProductModelType>("Product", productSchema);

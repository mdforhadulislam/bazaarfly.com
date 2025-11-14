import {
  Schema,
  model,
  Document,
  Model,
  models,
} from "mongoose";
import slugify from "slugify";

// ------------------------------------------------------
// INTERFACE
// ------------------------------------------------------

export interface ITag extends Document {
  name: string;
  slug: string;

  createdAt: Date;
  updatedAt: Date;
}

export type TagModelType = Model<ITag, Record<string, never>>;

// ------------------------------------------------------
// SCHEMA
// ------------------------------------------------------

const tagSchema = new Schema<ITag, TagModelType>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// ------------------------------------------------------
// INDEXES
// ------------------------------------------------------

tagSchema.index({ name: "text" });
tagSchema.index({ slug: 1 });

// ------------------------------------------------------
// PRE-SAVE — AUTO SLUG
// ------------------------------------------------------

tagSchema.pre("save", async function (next) {
  if (!this.slug) {
    const baseSlug = slugify(this.name, { lower: true, strict: true });
    let uniqueSlug = baseSlug;
    let counter = 2;

    const exists = await (this.constructor as TagModelType).findOne({
      slug: uniqueSlug,
    });

    if (exists) {
      while (
        await (this.constructor as TagModelType).findOne({
          slug: `${baseSlug}-${counter}`,
        })
      ) {
        counter++;
      }
      uniqueSlug = `${baseSlug}-${counter}`;
    }

    this.slug = uniqueSlug;
  }

  next();
});

// ------------------------------------------------------
// EXPORT MODEL
// ------------------------------------------------------

export const Tag =
  (models.Tag as TagModelType) ||
  model<ITag, TagModelType>("Tag", tagSchema);

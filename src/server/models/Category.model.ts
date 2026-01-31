import { Document, Model, Schema, Types, model, models } from "mongoose";
import slugify from "slugify";

// --------------------------------------------------
// BASE DOCUMENT INTERFACE (MONGOOSE DOCUMENT)
// --------------------------------------------------

export interface ICategory extends Document {
  name: string;
  slug: string;

  image?: string;
  icon?: string;
  banner?: string;

  parent?: Types.ObjectId | null;
  level: number;

  isActive: boolean;
  priority: number;

  createdAt: Date;
  updatedAt: Date;
}

// --------------------------------------------------
// LEAN CATEGORY TYPE (PLAIN OBJECT)
// --------------------------------------------------

export interface ICategoryLean {
  _id: string;
  name: string;
  slug: string;

  image?: string;
  icon?: string;
  banner?: string;

  parent?: string | null;
  level: number;

  isActive: boolean;
  priority: number;

  createdAt: Date;
  updatedAt: Date;
}

// --------------------------------------------------
// TREE NODE TYPE
// --------------------------------------------------

export interface ICategoryNode extends ICategoryLean {
  children: ICategoryNode[];
}

// --------------------------------------------------
// STATIC METHODS TYPE
// --------------------------------------------------

export interface ICategoryStatics {
  generateSlug(name: string): Promise<string>;
  getChildren(parentId: string): Promise<ICategoryLean[]>;
  getTree(): Promise<ICategoryNode[]>;
}

export type CategoryModelType = Model<ICategory> & ICategoryStatics;

// --------------------------------------------------
// SCHEMA
// --------------------------------------------------

const categorySchema = new Schema<ICategory, CategoryModelType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    image: { type: String },
    icon: { type: String },
    banner: { type: String },

    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    level: {
      type: Number,
      default: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    priority: {
      type: Number,
      default: 1,
      index: true,
    },
  },
  { timestamps: true }
);

// --------------------------------------------------
// INDEXES
// --------------------------------------------------

categorySchema.index({ name: "text" });
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ isActive: 1, priority: -1 });

// --------------------------------------------------
// STATIC: GENERATE UNIQUE SLUG
// --------------------------------------------------

categorySchema.statics.generateSlug = async function (
  name: string
): Promise<string> {
  const baseSlug = slugify(name, { lower: true, strict: true });
  const uniqueSlug = baseSlug;

  const exists = await this.findOne({ slug: uniqueSlug }).lean();
  if (!exists) return uniqueSlug;

  let counter = 2;
  while (await this.findOne({ slug: `${baseSlug}-${counter}` }).lean()) {
    counter++;
  }

  return `${baseSlug}-${counter}`;
};

// --------------------------------------------------
// PRE-SAVE: SET SLUG & LEVEL
// --------------------------------------------------

categorySchema.pre("save", async function (next) {
  const CategoryModel = this.constructor as CategoryModelType;

  if (!this.slug) {
    this.slug = await CategoryModel.generateSlug(this.name);
  }

  if (this.parent) {
    const parentCat = await CategoryModel.findById(
      this.parent
    ).lean<ICategoryLean | null>();
    this.level = parentCat ? parentCat.level + 1 : 1;
  } else {
    this.level = 1;
  }

  next();
});

// --------------------------------------------------
// STATIC: GET CHILDREN (STRICT TYPED)
// --------------------------------------------------

categorySchema.statics.getChildren = async function (
  parentId: string
): Promise<ICategoryLean[]> {
  return this.find({ parent: parentId })
    .sort({ priority: -1 })
    .lean<ICategoryLean[]>()
    .exec();
};

// --------------------------------------------------
// STATIC: GET FULL TREE (STRICT TYPED)
// --------------------------------------------------

categorySchema.statics.getTree = async function (): Promise<ICategoryNode[]> {
  const categories = await this.find()
    .sort({ priority: -1 })
    .lean<ICategoryLean[]>()
    .exec();

  const map = new Map<string, ICategoryNode>();

  // Initialize nodes
  categories.forEach((cat) =>
    map.set(cat._id.toString(), { ...cat, children: [] })
  );

  const tree: ICategoryNode[] = [];

  // Build tree
  categories.forEach((cat) => {
    const node = map.get(cat._id.toString());
    if (!node) return;

    if (cat.parent) {
      const parent = map.get(cat.parent.toString());
      if (parent) parent.children.push(node);
    } else {
      tree.push(node);
    }
  });

  return tree;
};

// --------------------------------------------------
// EXPORT MODEL
// --------------------------------------------------

export const Category =
  (models.Category as CategoryModelType) ||
  model<ICategory, CategoryModelType>("Category", categorySchema);

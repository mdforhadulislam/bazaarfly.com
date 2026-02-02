"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  PackagePlus,
  Image as ImageIcon,
  Plus,
  Trash2,
  Save,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type ProductStatus = "active" | "inactive" | "out_of_stock" | "draft";

type ColorVariant = {
  name: string;
  hex?: string;
  images: string[]; // later: upload -> url array
};

type ProductForm = {
  name: string;
  slug: string;
  sku: string;
  description: string;

  category: string;
  tags: string[];

  status: ProductStatus;
  stock: number;

  basePrice: number;
  discountPrice?: number | null;

  images: string[]; // product images urls
  colors: ColorVariant[];
};

/* ---------------- HELPERS ---------------- */
const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

function clampNumber(v: number, min: number, max: number) {
  if (Number.isNaN(v)) return min;
  return Math.min(max, Math.max(min, v));
}

/* ---------------- DUMMY OPTIONS ---------------- */
const categoryOptions = ["Fashion", "Electronics", "Home & Living", "Beauty"];
const tagOptions = ["New", "Trending", "Hot Deal", "Exclusive", "Limited"];

/* ---------------- PAGE ---------------- */
export default function AdminProductCreatePage() {
  const [form, setForm] = useState<ProductForm>({
    name: "",
    slug: "",
    sku: "",
    description: "",

    category: "",
    tags: [],

    status: "active",
    stock: 0,

    basePrice: 0,
    discountPrice: null,

    images: [],
    colors: [],
  });

  const finalPrice = useMemo(() => {
    const base = Number(form.basePrice || 0);
    const discount = Number(form.discountPrice || 0);
    if (form.discountPrice && discount > 0 && discount < base) return discount;
    return base;
  }, [form.basePrice, form.discountPrice]);

  const update = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const onNameChange = (name: string) => {
    setForm((p) => ({
      ...p,
      name,
      slug: p.slug ? p.slug : slugify(name), // auto slug only if empty
    }));
  };

  /* ---------- TAGS ---------- */
  const toggleTag = (tag: string) => {
    setForm((p) => {
      const exists = p.tags.includes(tag);
      return {
        ...p,
        tags: exists ? p.tags.filter((t) => t !== tag) : [...p.tags, tag],
      };
    });
  };

  /* ---------- IMAGES (URL ADD) ---------- */
  const addImageUrl = () => {
    const url = prompt("Paste image URL (demo)");
    if (!url) return;
    setForm((p) => ({ ...p, images: [...p.images, url] }));
  };

  const removeImage = (idx: number) => {
    setForm((p) => ({
      ...p,
      images: p.images.filter((_, i) => i !== idx),
    }));
  };

  /* ---------- COLOR VARIANTS ---------- */
  const addColor = () => {
    setForm((p) => ({
      ...p,
      colors: [...p.colors, { name: "", hex: "", images: [] }],
    }));
  };

  const updateColor = (index: number, patch: Partial<ColorVariant>) => {
    setForm((p) => ({
      ...p,
      colors: p.colors.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    }));
  };

  const removeColor = (index: number) => {
    setForm((p) => ({
      ...p,
      colors: p.colors.filter((_, i) => i !== index),
    }));
  };

  const addColorImageUrl = (index: number) => {
    const url = prompt("Paste color image URL (demo)");
    if (!url) return;
    setForm((p) => ({
      ...p,
      colors: p.colors.map((c, i) =>
        i === index ? { ...c, images: [...c.images, url] } : c
      ),
    }));
  };

  const removeColorImage = (colorIndex: number, imgIndex: number) => {
    setForm((p) => ({
      ...p,
      colors: p.colors.map((c, i) =>
        i === colorIndex
          ? { ...c, images: c.images.filter((_, j) => j !== imgIndex) }
          : c
      ),
    }));
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async () => {
    // basic validation
    if (!form.name.trim()) return alert("Product name is required");
    if (!form.slug.trim()) return alert("Slug is required");
    if (!form.sku.trim()) return alert("SKU is required");
    if (!form.category.trim()) return alert("Category is required");
    if (form.basePrice <= 0) return alert("Base price must be greater than 0");

    // TODO: connect API
    console.log("CREATE PRODUCT PAYLOAD:", {
      ...form,
      finalPrice,
    });

    alert("Product created (demo). Now connect to API.");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-orange-600"
          >
            <ArrowLeft size={16} />
            Back to Products
          </Link>

          <h1 className="text-2xl font-semibold text-gray-800 mt-2">
            Create New Product
          </h1>
          <p className="text-sm text-gray-500">
            Add product details, pricing, images and variants.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700"
        >
          <Save size={16} />
          Save Product
        </button>
      </div>

      {/* FORM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: MAIN FORM */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800 inline-flex items-center gap-2">
              <PackagePlus size={18} className="text-orange-600" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Product Name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="e.g. Premium Cotton Shirt"
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Slug *
                </label>
                <input
                  value={form.slug}
                  onChange={(e) => update("slug", slugify(e.target.value))}
                  placeholder="premium-cotton-shirt"
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  URL friendly slug (auto from name if empty).
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">
                  SKU *
                </label>
                <input
                  value={form.sku}
                  onChange={(e) => update("sku", e.target.value.toUpperCase())}
                  placeholder="BF-SHIRT-001"
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => update("status", e.target.value as ProductStatus)}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-white outline-none"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="out_of_stock">out_of_stock</option>
                  <option value="draft">draft</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Write product description..."
                className="mt-1 w-full min-h-[120px] border rounded-md px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800">Pricing & Inventory</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Base Price (BDT) *
                </label>
                <input
                  type="number"
                  value={form.basePrice}
                  onChange={(e) =>
                    update("basePrice", clampNumber(Number(e.target.value), 0, 99999999))
                  }
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Discount Price (optional)
                </label>
                <input
                  type="number"
                  value={form.discountPrice ?? ""}
                  onChange={(e) => {
                    const v = e.target.value === "" ? null : Number(e.target.value);
                    update("discountPrice", v);
                  }}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Must be less than base price.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Final Price
                </label>
                <div className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-800 font-semibold">
                  ৳ {finalPrice.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Stock *
                </label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) =>
                    update("stock", clampNumber(Number(e.target.value), 0, 999999))
                  }
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-gray-800 inline-flex items-center gap-2">
                <ImageIcon size={18} className="text-orange-600" />
                Product Images
              </h2>

              <button
                onClick={addImageUrl}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-semibold hover:bg-gray-50"
              >
                <Plus size={16} />
                Add Image URL
              </button>
            </div>

            {form.images.length === 0 ? (
              <div className="border rounded-lg bg-gray-50 p-8 text-center text-sm text-gray-500">
                No images added yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {form.images.map((url, idx) => (
                  <div
                    key={idx}
                    className="border rounded-lg overflow-hidden bg-white"
                  >
                    <img
                      src={url}
                      alt={`Product ${idx}`}
                      className="w-full h-28 object-cover bg-gray-50"
                    />
                    <div className="p-2 flex justify-between items-center">
                      <p className="text-[11px] text-gray-500 truncate">
                        {url}
                      </p>
                      <button
                        onClick={() => removeImage(idx)}
                        className="text-red-600 hover:bg-red-50 rounded-md p-1"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Color Variants */}
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-gray-800">
                Color Variants (optional)
              </h2>

              <button
                onClick={addColor}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-semibold hover:bg-gray-50"
              >
                <Plus size={16} />
                Add Color
              </button>
            </div>

            {form.colors.length === 0 ? (
              <div className="border rounded-lg bg-gray-50 p-8 text-center text-sm text-gray-500">
                No color variants added.
              </div>
            ) : (
              <div className="space-y-4">
                {form.colors.map((c, idx) => (
                  <div key={idx} className="border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                        <div>
                          <label className="text-xs font-semibold text-gray-600">
                            Color Name
                          </label>
                          <input
                            value={c.name}
                            onChange={(e) =>
                              updateColor(idx, { name: e.target.value })
                            }
                            placeholder="Red"
                            className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-600">
                            Hex (optional)
                          </label>
                          <input
                            value={c.hex ?? ""}
                            onChange={(e) =>
                              updateColor(idx, { hex: e.target.value })
                            }
                            placeholder="#FF0000"
                            className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            onClick={() => addColorImageUrl(idx)}
                            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-semibold hover:bg-gray-50"
                          >
                            <Plus size={16} />
                            Add Color Image URL
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeColor(idx)}
                        className="text-red-600 hover:bg-red-50 rounded-md p-2"
                        title="Remove color"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {c.images.length > 0 ? (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {c.images.map((url, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="border rounded-lg overflow-hidden"
                          >
                            <img
                              src={url}
                              alt="Color"
                              className="w-full h-24 object-cover bg-gray-50"
                            />
                            <div className="p-2 flex justify-between items-center">
                              <p className="text-[11px] text-gray-500 truncate">
                                {url}
                              </p>
                              <button
                                onClick={() => removeColorImage(idx, imgIndex)}
                                className="text-red-600 hover:bg-red-50 rounded-md p-1"
                                title="Remove"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 border rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                        No images for this color.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: META */}
        <div className="space-y-6">
          {/* Category & Tags */}
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800">Category & Tags</h2>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-white outline-none"
              >
                <option value="">Select category</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Tags</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {tagOptions.map((t) => {
                  const active = form.tags.includes(t);
                  return (
                    <button
                      type="button"
                      key={t}
                      onClick={() => toggleTag(t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        active
                          ? "bg-orange-100 text-orange-700 border-orange-200"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              {form.tags.length > 0 ? (
                <p className="text-xs text-gray-500 mt-2">
                  Selected:{" "}
                  <span className="font-semibold">{form.tags.join(", ")}</span>
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-2">No tags selected.</p>
              )}
            </div>
          </div>

          {/* Quick Summary */}
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-3">
            <h2 className="font-semibold text-gray-800">Summary</h2>

            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <span className="text-gray-500">Name:</span>{" "}
                <span className="font-semibold">{form.name || "-"}</span>
              </p>
              <p>
                <span className="text-gray-500">Slug:</span>{" "}
                <span className="font-semibold">{form.slug || "-"}</span>
              </p>
              <p>
                <span className="text-gray-500">SKU:</span>{" "}
                <span className="font-semibold">{form.sku || "-"}</span>
              </p>
              <p>
                <span className="text-gray-500">Final Price:</span>{" "}
                <span className="font-semibold">
                  ৳ {finalPrice.toLocaleString()}
                </span>
              </p>
              <p>
                <span className="text-gray-500">Stock:</span>{" "}
                <span className="font-semibold">{form.stock}</span>
              </p>
              <p>
                <span className="text-gray-500">Images:</span>{" "}
                <span className="font-semibold">{form.images.length}</span>
              </p>
              <p>
                <span className="text-gray-500">Colors:</span>{" "}
                <span className="font-semibold">{form.colors.length}</span>
              </p>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700"
            >
              <Save size={16} />
              Save Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

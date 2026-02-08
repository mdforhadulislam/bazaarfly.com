"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  PackagePlus,
  Image as ImageIcon,
  Plus,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type ProductStatus = "active" | "inactive" | "out_of_stock" | "draft";

type ColorVariant = {
  name: string;
  hex?: string;
  images: string[]; // cloudinary urls
};

type ProductForm = {
  name: string;
  slug: string;
  sku: string;
  description: string;

  category: string; // should be category ObjectId (recommended)
  tags: string[]; // should be tag ObjectId[] (recommended)

  status: ProductStatus;
  stock: number;

  basePrice: number;
  discountPrice?: number | null;

  images: string[];
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

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/* ---------------- DUMMY OPTIONS ----------------
   NOTE: In real app, these should come from API:
   /api/categories, /api/tags returning _id + name
------------------------------------------------- */
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

  const [saving, setSaving] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingColorIndex, setUploadingColorIndex] = useState<number | null>(null);

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
      slug: p.slug ? p.slug : slugify(name),
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

  /* ---------- IMAGES (REMOVE) ---------- */
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

  /* ======================================================
     API: CREATE PRODUCT
     POST /api/products
  ====================================================== */
  const createProduct = async () => {
    // basic validation
    if (!form.name.trim()) throw new Error("Product name is required");
    if (!form.slug.trim()) throw new Error("Slug is required");
    if (!form.sku.trim()) throw new Error("SKU is required");
    if (!form.category.trim()) throw new Error("Category is required");
    if (Number(form.basePrice) <= 0) throw new Error("Base price must be greater than 0");

    const payload = {
      ...form,
      // finalPrice is virtual; no need to send
      // also: category/tags ideally ObjectId(s)
    };

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const json = await safeJson(res);
    if (!res.ok) throw new Error(json?.message || json?.msg || "Failed to create product");

    return json?.data; // created product doc
  };

  /* ======================================================
     API: UPLOAD IMAGE
     PATCH /api/products/[slug]?type=image
     FormData field: file
  ====================================================== */
  const uploadProductImage = async (slug: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`/api/products/${encodeURIComponent(slug)}?type=image`, {
      method: "PATCH",
      credentials: "include",
      body: fd,
    });

    const json = await safeJson(res);
    if (!res.ok) throw new Error(json?.message || json?.msg || "Image upload failed");

    // updated product returned
    return json?.data;
  };

  /* ---------- MAIN IMAGE UPLOAD (UI) ---------- */
  const handleMainImagePick = async (file: File | null) => {
    if (!file) return;

    // must have slug
    const slug = form.slug?.trim();
    if (!slug) return alert("Please set product slug first (name/slug).");

    try {
      setUploadingMain(true);
      const updatedProduct = await uploadProductImage(slug, file);

      // backend pushes URL into images[]
      const newImages: string[] = updatedProduct?.images ?? [];
      setForm((p) => ({ ...p, images: newImages }));

      alert("Image uploaded successfully");
    } catch (e: any) {
      alert(e?.message || "Failed to upload image");
    } finally {
      setUploadingMain(false);
    }
  };

  /* ---------- COLOR IMAGE UPLOAD (UI) ----------
     NOTE: Your backend PATCH currently only pushes to product.images,
     it does NOT support pushing into colors[].images.
     So here we upload to product.images first, then copy that URL into the selected color images in UI.
     (Best practice: create a dedicated endpoint for color images. If you want, I can update the API.)
  ---------------------------------------------- */
  const handleColorImagePick = async (colorIndex: number, file: File | null) => {
    if (!file) return;
    const slug = form.slug?.trim();
    if (!slug) return alert("Please set product slug first (name/slug).");

    try {
      setUploadingColorIndex(colorIndex);
      const updatedProduct = await uploadProductImage(slug, file);

      // get last uploaded url (since backend pushes to images)
      const imgs: string[] = updatedProduct?.images ?? [];
      const lastUrl = imgs[imgs.length - 1];
      if (!lastUrl) throw new Error("Upload succeeded but URL not found");

      // add into color variant images in UI
      setForm((p) => ({
        ...p,
        colors: p.colors.map((c, i) =>
          i === colorIndex ? { ...c, images: [...c.images, lastUrl] } : c
        ),
        images: imgs, // keep product images in sync with backend
      }));

      alert("Color image uploaded successfully");
    } catch (e: any) {
      alert(e?.message || "Failed to upload color image");
    } finally {
      setUploadingColorIndex(null);
    }
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async () => {
    try {
      setSaving(true);
      const created = await createProduct();

      alert("Product created successfully ✅");

      // optional: redirect after create
      // window.location.href = `/admin/products/${created?._id}`;
    } catch (e: any) {
      alert(e?.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
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

          <h1 className="text-2xl font-semibold text-gray-800 mt-2">Create New Product</h1>
          <p className="text-sm text-gray-500">Add product details, pricing, images and variants.</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Product
        </button>
      </div>

      {/* FORM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800 inline-flex items-center gap-2">
              <PackagePlus size={18} className="text-orange-600" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">Product Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder="e.g. Premium Cotton Shirt"
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Slug *</label>
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
                <label className="text-xs font-semibold text-gray-600">SKU *</label>
                <input
                  value={form.sku}
                  onChange={(e) => update("sku", e.target.value.toUpperCase())}
                  placeholder="BF-SHIRT-001"
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Status</label>
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
              <label className="text-xs font-semibold text-gray-600">Description</label>
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
                <label className="text-xs font-semibold text-gray-600">Base Price (BDT) *</label>
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
                <p className="text-[11px] text-gray-500 mt-1">Must be less than base price.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Final Price</label>
                <div className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-800 font-semibold">
                  ৳ {finalPrice.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Stock *</label>
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

              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-semibold hover:bg-gray-50 cursor-pointer">
                {uploadingMain ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleMainImagePick(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <p className="text-[11px] text-gray-500">
              Note: Images upload uses <span className="font-semibold">PATCH /api/products/[slug]?type=image</span>. Make sure slug is set.
            </p>

            {form.images.length === 0 ? (
              <div className="border rounded-lg bg-gray-50 p-8 text-center text-sm text-gray-500">
                No images added yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {form.images.map((url, idx) => (
                  <div key={idx} className="border rounded-lg overflow-hidden bg-white">
                    <img src={url} alt={`Product ${idx}`} className="w-full h-28 object-cover bg-gray-50" />
                    <div className="p-2 flex justify-between items-center">
                      <p className="text-[11px] text-gray-500 truncate">{url}</p>
                      <button
                        onClick={() => removeImage(idx)}
                        className="text-red-600 hover:bg-red-50 rounded-md p-1"
                        title="Remove"
                        type="button"
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
              <h2 className="font-semibold text-gray-800">Color Variants (optional)</h2>

              <button
                onClick={addColor}
                type="button"
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
                          <label className="text-xs font-semibold text-gray-600">Color Name</label>
                          <input
                            value={c.name}
                            onChange={(e) => updateColor(idx, { name: e.target.value })}
                            placeholder="Red"
                            className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-600">Hex (optional)</label>
                          <input
                            value={c.hex ?? ""}
                            onChange={(e) => updateColor(idx, { hex: e.target.value })}
                            placeholder="#FF0000"
                            className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                          />
                        </div>

                        <div className="flex items-end">
                          <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-semibold hover:bg-gray-50 cursor-pointer">
                            {uploadingColorIndex === idx ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Plus size={16} />
                            )}
                            Upload Color Image
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleColorImagePick(idx, e.target.files?.[0] ?? null)}
                            />
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={() => removeColor(idx)}
                        className="text-red-600 hover:bg-red-50 rounded-md p-2"
                        title="Remove color"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="text-[11px] text-gray-500 mt-2">
                      Color image uploads currently reuse product image upload endpoint, then copy the last URL into this color variant.
                      If you want proper color-image API, I can update your PATCH endpoint to support <span className="font-semibold">colors[index].images</span>.
                    </p>

                    {c.images.length > 0 ? (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {c.images.map((url, imgIndex) => (
                          <div key={imgIndex} className="border rounded-lg overflow-hidden">
                            <img src={url} alt="Color" className="w-full h-24 object-cover bg-gray-50" />
                            <div className="p-2 flex justify-between items-center">
                              <p className="text-[11px] text-gray-500 truncate">{url}</p>
                              <button
                                onClick={() => removeColorImage(idx, imgIndex)}
                                className="text-red-600 hover:bg-red-50 rounded-md p-1"
                                title="Remove"
                                type="button"
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

        {/* RIGHT */}
        <div className="space-y-6">
          {/* Category & Tags */}
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800">Category & Tags</h2>

            <div>
              <label className="text-xs font-semibold text-gray-600">Category *</label>
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
              <p className="text-[11px] text-gray-500 mt-1">
                Note: Your Product schema expects <span className="font-semibold">category = ObjectId</span>.  
                Now you are sending a string. Better: load categories from DB and store _id.
              </p>
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
                  Selected: <span className="font-semibold">{form.tags.join(", ")}</span>
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-2">No tags selected.</p>
              )}
            </div>
          </div>

          {/* Summary */}
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
                <span className="font-semibold">৳ {finalPrice.toLocaleString()}</span>
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
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

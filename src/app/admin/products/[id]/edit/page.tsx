"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Image as ImageIcon,
  PackagePlus,
  Loader2,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type ProductStatus = "active" | "inactive" | "out_of_stock" | "draft";

type ColorVariant = {
  name: string;
  hex?: string;
  images: string[];
};

type ProductForm = {
  name: string;
  slug: string;
  sku: string;
  description: string;

  category: string; // ObjectId
  tags: string[]; // ObjectId[]

  status: ProductStatus;
  stock: number;

  basePrice: number;
  discountPrice?: number | null;

  commissionPercent: number;
  commissionAmount: number;

  images: string[];
  colors: ColorVariant[];
};

type OptionItem = {
  _id: string;
  name: string;
  slug?: string;
};

/* ---------------- HELPERS ---------------- */
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function normalizeList<T = any>(v: any): T[] {
  if (Array.isArray(v)) return v;
  if (Array.isArray(v?.data)) return v.data;
  if (Array.isArray(v?.data?.items)) return v.data.items;
  if (Array.isArray(v?.data?.categories)) return v.data.categories;
  if (Array.isArray(v?.data?.tags)) return v.data.tags;
  if (Array.isArray(v?.items)) return v.items;
  if (Array.isArray(v?.categories)) return v.categories;
  if (Array.isArray(v?.tags)) return v.tags;
  return [];
}

function pickErrorMessage(json: any, fallback = "Something went wrong") {
  return (
    json?.message ||
    json?.msg ||
    json?.error?.message ||
    json?.error ||
    fallback
  );
}

function clampNumber(v: number, min: number, max: number) {
  if (Number.isNaN(v)) return min;
  return Math.min(max, Math.max(min, v));
}

/* ---------------- API ROUTES (v1) ---------------- */
const API = {
  category: "/api/v1/category",
  tag: "/api/v1/tag",
  productBySlug: (slug: string) => `/api/v1/product/${encodeURIComponent(slug)}`,
  productPatch: (slug: string) => `/api/v1/product/${encodeURIComponent(slug)}`,
};

/* ---------------- PAGE ---------------- */
export default function AdminProductEditPage() {
  const params = useParams();
  const router = useRouter();

  // NOTE: your API is slug-based, so we treat [id] as slug
  const slug = String(params?.id || "");

  const [loading, setLoading] = useState(true);
  const [metaLoading, setMetaLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState<OptionItem[]>([]);
  const [tagOptions, setTagOptions] = useState<OptionItem[]>([]);

  const [form, setForm] = useState<ProductForm>({
    name: "",
    slug: "",
    sku: "",
    description: "",
    category: "",
    tags: [],
    status: "draft",
    stock: 0,
    basePrice: 0,
    discountPrice: null,
    commissionPercent: 0,
    commissionAmount: 0,
    images: [],
    colors: [],
  });

  const finalPrice = useMemo(() => {
    const base = Number(form.basePrice || 0);
    const discount = Number(form.discountPrice || 0);
    if (form.discountPrice != null && discount > 0 && discount < base) return discount;
    return base;
  }, [form.basePrice, form.discountPrice]);

  // Commission amount auto calculation
  const computedCommissionAmount = useMemo(() => {
    const percent = Number(form.commissionPercent || 0);
    if (percent <= 0) return 0;
    return Math.round((finalPrice * percent) / 100);
  }, [finalPrice, form.commissionPercent]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, commissionAmount: computedCommissionAmount }));
  }, [computedCommissionAmount]);

  const update = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const toggleTag = (tagId: string) => {
    setForm((p) => {
      const exists = p.tags.includes(tagId);
      return {
        ...p,
        tags: exists ? p.tags.filter((t) => t !== tagId) : [...p.tags, tagId],
      };
    });
  };

  const fetchMeta = async () => {
    try {
      setMetaLoading(true);

      const [catRes, tagRes] = await Promise.all([
        fetch(API.category, { credentials: "include" }),
        fetch(API.tag, { credentials: "include" }),
      ]);

      const catJson = await safeJson(catRes);
      const tagJson = await safeJson(tagRes);

      setCategoryOptions(normalizeList<OptionItem>(catJson));
      setTagOptions(normalizeList<OptionItem>(tagJson));
    } catch {
      // ignore
    } finally {
      setMetaLoading(false);
    }
  };

  const fetchProduct = async () => {
    const res = await fetch(API.productBySlug(slug), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const json = await safeJson(res);
    if (!res.ok) throw new Error(pickErrorMessage(json, "Failed to fetch product"));
    return json?.data as any;
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        await fetchMeta();

        const p = await fetchProduct();
        if (!mounted) return;

        // normalize incoming populated docs -> IDs
        const categoryId =
          typeof p?.category === "string" ? p.category : p?.category?._id || "";

        const tagsIds: string[] = Array.isArray(p?.tags)
          ? p.tags
              .map((t: any) => (typeof t === "string" ? t : t?._id))
              .filter(Boolean)
          : [];

        setForm({
          name: p?.name || "",
          slug: p?.slug || "",
          sku: p?.sku || "",
          description: p?.description || "",
          category: categoryId,
          tags: tagsIds,
          status: p?.status || "draft",
          stock: Number(p?.stock || 0),
          basePrice: Number(p?.basePrice || 0),
          discountPrice: p?.discountPrice ?? null,

          commissionPercent: Number(p?.commissionPercent || 0),
          commissionAmount: Number(p?.commissionAmount || 0),

          images: Array.isArray(p?.images) ? p.images : [],
          colors: Array.isArray(p?.colors) ? p.colors : [],
        });
      } catch (e: any) {
        alert(e?.message || "Failed to load product");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  /* ---------- IMAGES: UPLOAD / REMOVE (API SUPPORTED) ---------- */
  const uploadProductImage = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);

    // Backend expectation (recommended):
    // PATCH /api/v1/product/:slug?type=image
    const res = await fetch(`${API.productPatch(form.slug)}?type=image`, {
      method: "PATCH",
      credentials: "include",
      body: fd,
    });

    const json = await safeJson(res);
    if (!res.ok) throw new Error(pickErrorMessage(json, "Image upload failed"));
    return json?.data;
  };

  const handlePickImage = async (file: File | null) => {
    if (!file) return;
    if (!form.slug) return alert("Slug missing");

    try {
      setSaving(true);
      const updated = await uploadProductImage(file);
      const imgs: string[] = updated?.images ?? [];
      setForm((p) => ({ ...p, images: imgs }));
      alert("Image uploaded ✅");
    } catch (e: any) {
      alert(e?.message || "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  const removeImageUI = (idx: number) => {
    setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
  };

  const removeImageFromBackend = async (url: string) => {
    // Backend expectation (recommended):
    // PATCH /api/v1/product/:slug?type=image-remove
    // body: { url }
    const res = await fetch(`${API.productPatch(form.slug)}?type=image-remove`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ url }),
    });

    const json = await safeJson(res);
    if (!res.ok) throw new Error(pickErrorMessage(json, "Remove image failed"));
    return json?.data;
  };

  const handleRemoveProductImage = async (idx: number) => {
    const url = form.images[idx];
    if (!url) return;

    // UI-first (works even if backend endpoint not ready)
    removeImageUI(idx);

    // If you already implemented the endpoint, it will sync:
    try {
      const updated = await removeImageFromBackend(url);
      if (updated?.images) setForm((p) => ({ ...p, images: updated.images }));
    } catch {
      // If backend not supported, keep UI change only (no hard error)
    }
  };

  /* ---------- COLORS (UI + API HOOKS) ---------- */
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
    setForm((p) => ({ ...p, colors: p.colors.filter((_, i) => i !== index) }));
  };

  const removeColorImageUI = (colorIndex: number, imgIndex: number) => {
    setForm((p) => ({
      ...p,
      colors: p.colors.map((c, i) =>
        i === colorIndex
          ? { ...c, images: c.images.filter((_, j) => j !== imgIndex) }
          : c
      ),
    }));
  };

  const uploadColorImage = async (file: File, colorIndex: number) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("colorIndex", String(colorIndex));

    // Backend expectation (recommended):
    // PATCH /api/v1/product/:slug?type=color-image
    const res = await fetch(`${API.productPatch(form.slug)}?type=color-image`, {
      method: "PATCH",
      credentials: "include",
      body: fd,
    });

    const json = await safeJson(res);
    if (!res.ok) throw new Error(pickErrorMessage(json, "Color image upload failed"));
    return json?.data;
  };

  const removeColorImageFromBackend = async (colorIndex: number, url: string) => {
    // Backend expectation (recommended):
    // PATCH /api/v1/product/:slug?type=color-image-remove
    // body: { colorIndex, url }
    const res = await fetch(`${API.productPatch(form.slug)}?type=color-image-remove`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ colorIndex, url }),
    });

    const json = await safeJson(res);
    if (!res.ok) throw new Error(pickErrorMessage(json, "Remove color image failed"));
    return json?.data;
  };

  const handlePickColorImage = async (file: File | null, colorIndex: number) => {
    if (!file) return;
    if (!form.slug) return alert("Slug missing");

    try {
      setSaving(true);
      const updated = await uploadColorImage(file, colorIndex);
      if (updated?.colors) setForm((p) => ({ ...p, colors: updated.colors }));
      else alert("Uploaded, but response colors missing (check API)");
    } catch (e: any) {
      alert(e?.message || "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveColorImage = async (colorIndex: number, imgIndex: number) => {
    const url = form.colors?.[colorIndex]?.images?.[imgIndex];
    if (!url) return;

    // UI-first
    removeColorImageUI(colorIndex, imgIndex);

    // Sync if endpoint exists
    try {
      const updated = await removeColorImageFromBackend(colorIndex, url);
      if (updated?.colors) setForm((p) => ({ ...p, colors: updated.colors }));
    } catch {
      // keep UI-only if backend not ready
    }
  };

  /* ---------- SUBMIT ---------- */
  const handleUpdate = async () => {
    try {
      if (!form.name.trim()) throw new Error("Product name is required");
      if (!form.slug.trim()) throw new Error("Slug is required");
      if (!form.sku.trim()) throw new Error("SKU is required");
      if (!form.category.trim()) throw new Error("Category is required");
      if (Number(form.basePrice) <= 0) throw new Error("Base price must be greater than 0");

      setSaving(true);

      const res = await fetch(API.productBySlug(slug), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          stock: Number(form.stock || 0),
          basePrice: Number(form.basePrice || 0),
          discountPrice: form.discountPrice == null ? null : Number(form.discountPrice),
          commissionPercent: Number(form.commissionPercent || 0),
          commissionAmount: Number(computedCommissionAmount || 0),
          slug: form.slug, // keep slug in sync if changed
        }),
      });

      const json = await safeJson(res);
      if (!res.ok) throw new Error(pickErrorMessage(json, "Update failed"));

      alert("Product updated ✅");

      // if slug changed, redirect to new slug page
      if (form.slug && form.slug !== slug) {
        router.push(`/admin/products/${form.slug}/edit`);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (e: any) {
      alert(e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = confirm("Delete this product?");
    if (!ok) return;

    try {
      setSaving(true);
      const res = await fetch(API.productBySlug(slug), {
        method: "DELETE",
        credentials: "include",
      });

      const json = await safeJson(res);
      if (!res.ok) throw new Error(pickErrorMessage(json, "Delete failed"));

      alert("Product deleted ✅");
      router.push("/admin/products");
      router.refresh();
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-xl p-10 text-center text-sm text-gray-500 inline-flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" size={16} />
        Loading product...
      </div>
    );
  }

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

          <h1 className="text-2xl font-semibold text-gray-800 mt-2">Edit Product</h1>
          <p className="text-sm text-gray-500">Slug: {slug}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-red-500 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-60"
          >
            <Trash2 size={16} />
            Delete
          </button>

          <button
            onClick={handleUpdate}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Update
          </button>
        </div>
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
                  onChange={(e) => update("name", e.target.value)}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Slug *</label>
                <input
                  value={form.slug}
                  onChange={(e) => update("slug", e.target.value)}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  (Backend routes are slug-based. If you change slug, the URL should change too.)
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">SKU *</label>
                <input
                  value={form.sku}
                  onChange={(e) => update("sku", e.target.value.toUpperCase())}
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
                <label className="text-xs font-semibold text-gray-600">Discount Price (optional)</label>
                <input
                  type="number"
                  value={form.discountPrice ?? ""}
                  onChange={(e) => {
                    const v = e.target.value === "" ? null : Number(e.target.value);
                    update("discountPrice", v);
                  }}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                />
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

              {/* Commission */}
              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Commission Percent (%)
                </label>
                <input
                  type="number"
                  value={form.commissionPercent}
                  onChange={(e) =>
                    update("commissionPercent", clampNumber(Number(e.target.value), 0, 100))
                  }
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Commission Amount (BDT)
                </label>
                <div className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-800 font-semibold">
                  ৳ {computedCommissionAmount.toLocaleString()}
                </div>
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
                <Plus size={16} />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePickImage(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            {form.images.length === 0 ? (
              <div className="border rounded-lg bg-gray-50 p-8 text-center text-sm text-gray-500">
                No images added.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {form.images.map((url, idx) => (
                  <div key={idx} className="border rounded-lg overflow-hidden">
                    <img src={url} alt="Product" className="w-full h-28 object-cover bg-gray-50" />
                    <div className="p-2 flex justify-between items-center gap-2">
                      <p className="text-[11px] text-gray-500 truncate">{url}</p>
                      <button
                        onClick={() => handleRemoveProductImage(idx)}
                        className="text-red-600 hover:bg-red-50 rounded-md p-1"
                        type="button"
                        title="Remove"
                        disabled={saving}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[11px] text-gray-500">
              If backend supports remove: PATCH <span className="font-semibold">?type=image-remove</span> will sync.
              Otherwise UI will remove only.
            </p>
          </div>

          {/* Colors */}
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-gray-800">Color Variants (optional)</h2>

              <button
                onClick={addColor}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-semibold hover:bg-gray-50"
                type="button"
              >
                <Plus size={16} />
                Add Color
              </button>
            </div>

            {form.colors.length === 0 ? (
              <div className="border rounded-lg bg-gray-50 p-8 text-center text-sm text-gray-500">
                No color variants.
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
                            className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-600">Hex (optional)</label>
                          <input
                            value={c.hex ?? ""}
                            onChange={(e) => updateColor(idx, { hex: e.target.value })}
                            className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                          />
                        </div>

                        <div className="flex items-end">
                          <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-semibold hover:bg-gray-50 cursor-pointer">
                            <Plus size={16} />
                            Upload Color Image
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handlePickColorImage(e.target.files?.[0] ?? null, idx)
                              }
                            />
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={() => removeColor(idx)}
                        className="text-red-600 hover:bg-red-50 rounded-md p-2"
                        type="button"
                        title="Remove color"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {c.images.length > 0 ? (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                        {c.images.map((url, imgIndex) => (
                          <div key={imgIndex} className="border rounded-lg overflow-hidden">
                            <img src={url} alt="Color" className="w-full h-24 object-cover bg-gray-50" />
                            <div className="p-2 flex justify-between items-center gap-2">
                              <p className="text-[11px] text-gray-500 truncate">{url}</p>
                              <button
                                onClick={() => handleRemoveColorImage(idx, imgIndex)}
                                className="text-red-600 hover:bg-red-50 rounded-md p-1"
                                type="button"
                                disabled={saving}
                                title="Remove color image"
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

                    <p className="text-[11px] text-gray-500 mt-3">
                      If backend supports: PATCH <span className="font-semibold">?type=color-image</span> and{" "}
                      <span className="font-semibold">?type=color-image-remove</span>, it will sync.
                      Otherwise it will behave UI-only.
                    </p>
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
                disabled={metaLoading}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-white outline-none disabled:opacity-60"
              >
                <option value="">{metaLoading ? "Loading categories..." : "Select category"}</option>

                {Array.isArray(categoryOptions) &&
                  categoryOptions.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Tags</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {Array.isArray(tagOptions) &&
                  tagOptions.map((t) => {
                    const active = form.tags.includes(t._id);
                    return (
                      <button
                        type="button"
                        key={t._id}
                        onClick={() => toggleTag(t._id)}
                        disabled={metaLoading}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition disabled:opacity-60 ${
                          active
                            ? "bg-orange-100 text-orange-700 border-orange-200"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
              </div>
            </div>

            <p className="text-[11px] text-gray-500">
              Selected tags:{" "}
              <span className="font-semibold">
                {form.tags
                  .map((id) => tagOptions.find((t) => t._id === id)?.name || id)
                  .join(", ") || "-"}
              </span>
            </p>
          </div>

          {/* Summary */}
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-2">
            <h2 className="font-semibold text-gray-800">Summary</h2>

            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <span className="text-gray-500">Name:</span>{" "}
                <span className="font-semibold">{form.name || "-"}</span>
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
                <span className="text-gray-500">Commission:</span>{" "}
                <span className="font-semibold">
                  {form.commissionPercent}% = ৳ {computedCommissionAmount.toLocaleString()}
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
              onClick={handleUpdate}
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Update Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Pencil,
  Boxes,
  Trash2,
  BadgePercent,
  Tag as TagIcon,
  Layers,
  Image as ImageIcon,
  Package,
  Loader2,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type ProductStatus = "active" | "inactive" | "out_of_stock" | "draft";

type ColorVariant = {
  name: string;
  hex?: string;
  images: string[];
};

type OptionItem = {
  _id: string;
  name: string;
  slug?: string;
};

type ProductDetails = {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;

  category: any; // populated object or string
  tags: any[]; // populated objects or string[]

  status: ProductStatus;
  stock: number;

  basePrice: number;
  discountPrice?: number | null;
  finalPrice?: number;

  commissionPercent?: number; // ✅ NEW
  commissionAmount?: number; // ✅ NEW

  images: string[];
  colors: ColorVariant[];

  createdAt?: string;
  updatedAt?: string;

  lowStockAlertEnabled?: boolean;
  lowStockThreshold?: number;
};

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function asArray<T = any>(v: any): T[] {
  if (Array.isArray(v)) return v;
  if (Array.isArray(v?.data)) return v.data;
  if (Array.isArray(v?.data?.items)) return v.data.items;
  if (Array.isArray(v?.data?.categories)) return v.data.categories;
  if (Array.isArray(v?.items)) return v.items;
  if (Array.isArray(v?.categories)) return v.categories;
  return [];
}

function formatDate(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function StatusBadge({ status }: { status: ProductStatus }) {
  const map: Record<ProductStatus, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-700",
    out_of_stock: "bg-red-100 text-red-700",
    draft: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
      {status}
    </span>
  );
}

function Pill({ text }: { text: string }) {
  return (
    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
      {text}
    </span>
  );
}

function getCategoryLabel(category: any) {
  if (!category) return "-";
  if (typeof category === "string") return category;
  return category?.name || category?.title || category?._id || "-";
}

function getTagLabels(tags: any[]) {
  if (!Array.isArray(tags)) return [];
  return tags.map((t) => (typeof t === "string" ? t : t?.name || t?.slug || t?._id)).filter(Boolean);
}

function computeFinalPrice(p: ProductDetails) {
  if (typeof p.finalPrice === "number") return p.finalPrice;
  const base = Number(p.basePrice || 0);
  const discount = Number(p.discountPrice || 0);
  if (p.discountPrice && discount > 0 && discount < base) return discount;
  return base;
}

/* ---------------- PAGE ---------------- */
export default function AdminProductDetailsPage() {
  const params = useParams();
  const slug = String(params?.id || "");

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");

  const [categoryOptions, setCategoryOptions] = useState<OptionItem[]>([]);
  const [tagOptions, setTagOptions] = useState<OptionItem[]>([]);
  const [metaLoading, setMetaLoading] = useState(true);

  const fetchMeta = async () => {
    try {
      setMetaLoading(true);
      const [catRes, tagRes] = await Promise.all([
        fetch("/api/category", { credentials: "include" }),
        fetch("/api/tag", { credentials: "include" }),
      ]);
      const catJson = await safeJson(catRes);
      const tagJson = await safeJson(tagRes);

      setCategoryOptions(asArray<OptionItem>(catJson));
      setTagOptions(asArray<OptionItem>(tagJson));
    } catch {
      // ignore meta errors
    } finally {
      setMetaLoading(false);
    }
  };

  const fetchProduct = async () => {
    const res = await fetch(`/api/product/${encodeURIComponent(slug)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const json = await safeJson(res);
    if (!res.ok) throw new Error(json?.message || json?.msg || "Failed to fetch product");

    return json?.data as ProductDetails;
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        await fetchMeta();

        const data = await fetchProduct();
        if (!mounted) return;

        setProduct(data);
        setActiveImage(data?.images?.[0] || "");
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

  const isLowStock = useMemo(() => {
    if (!product) return false;
    if (!product.lowStockAlertEnabled) return false;
    return product.stock <= (product.lowStockThreshold ?? 10);
  }, [product]);

  const discountPercent = useMemo(() => {
    if (!product) return 0;
    if (!product.discountPrice) return 0;
    if (product.basePrice <= 0) return 0;
    const d = product.basePrice - product.discountPrice;
    return Math.max(0, Math.round((d / product.basePrice) * 100));
  }, [product]);

  const handleDelete = async () => {
    const ok = confirm("Delete this product?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/product/${encodeURIComponent(slug)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.message || json?.msg || "Delete failed");

      alert("Product deleted ✅");
      window.location.href = "/admin/products";
    } catch (e: any) {
      alert(e?.message || "Delete failed");
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

  if (!product) {
    return (
      <div className="bg-white border rounded-xl p-10 text-center text-sm text-gray-500">
        Product not found.
      </div>
    );
  }

  const finalPrice = computeFinalPrice(product);
  const tagsLabel = getTagLabels(product.tags);

  // ✅ commission
  const commissionPercent = Number(product.commissionPercent || 0);
  const commissionAmount =
    typeof product.commissionAmount === "number"
      ? product.commissionAmount
      : Math.round((finalPrice * commissionPercent) / 100);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-orange-600"
          >
            <ArrowLeft size={16} />
            Back to Products
          </Link>

          <h1 className="text-2xl font-semibold text-gray-800 mt-2">{product.name}</h1>
          <p className="text-sm text-gray-500">
            ID: {product._id} • SKU: {product.sku} • Slug: {product.slug}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/products/${product.slug}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-semibold hover:bg-gray-50"
          >
            <Pencil size={16} />
            Edit
          </Link>

          <Link
            href={`/admin/products/${product.slug}/inventory`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-semibold hover:bg-gray-50"
          >
            <Boxes size={16} />
            Inventory
          </Link>

          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-1">
          <Package size={18} className="text-orange-600" />
          <p className="text-sm text-gray-500">Status</p>
          <div className="flex items-center gap-2">
            <StatusBadge status={product.status} />
            {isLowStock ? (
              <span className="text-xs font-semibold text-red-600">Low Stock</span>
            ) : (
              <span className="text-xs text-gray-500">Normal</span>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-1">
          <p className="text-sm text-gray-500">Stock</p>
          <p className="text-2xl font-semibold text-gray-800">{product.stock}</p>
          <p className="text-xs text-gray-500">Threshold: {product.lowStockThreshold ?? 10}</p>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-1">
          <p className="text-sm text-gray-500">Price</p>
          <p className="text-2xl font-semibold text-gray-800">৳ {finalPrice.toLocaleString()}</p>
          {product.discountPrice ? (
            <p className="text-xs text-gray-500">
              <span className="line-through">৳ {product.basePrice.toLocaleString()}</span> •{" "}
              {discountPercent}% off
            </p>
          ) : (
            <p className="text-xs text-gray-500">Base: ৳ {product.basePrice.toLocaleString()}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Commission: <span className="font-semibold">{commissionPercent}%</span> ={" "}
            <span className="font-semibold">৳ {commissionAmount.toLocaleString()}</span>
          </p>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-1">
          <p className="text-sm text-gray-500">Dates</p>
          <p className="text-sm font-semibold text-gray-800">Created</p>
          <p className="text-xs text-gray-500">{formatDate(product.createdAt)}</p>
          <p className="text-sm font-semibold text-gray-800 mt-2">Updated</p>
          <p className="text-xs text-gray-500">{formatDate(product.updatedAt)}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800 inline-flex items-center gap-2">
              <ImageIcon size={18} className="text-orange-600" />
              Images
            </h2>

            {activeImage ? (
              <div className="border rounded-xl overflow-hidden bg-gray-50">
                <img src={activeImage} alt="Active" className="w-full h-[320px] object-cover" />
              </div>
            ) : (
              <div className="border rounded-xl p-10 text-center text-gray-500">No images</div>
            )}

            {product.images?.length ? (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {product.images.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(url)}
                    className={`border rounded-lg overflow-hidden ${activeImage === url ? "ring-2 ring-orange-500" : ""}`}
                    title="View image"
                  >
                    <img src={url} alt={`thumb-${idx}`} className="w-full h-16 object-cover bg-gray-50" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Color Variants */}
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800 inline-flex items-center gap-2">
              <Layers size={18} className="text-orange-600" />
              Color Variants
            </h2>

            {product.colors?.length ? (
              <div className="space-y-4">
                {product.colors.map((c, idx) => (
                  <div key={idx} className="border rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full border" style={{ background: c.hex || "#fff" }} />
                        <div>
                          <p className="font-semibold text-gray-800">{c.name || "Unnamed"}</p>
                          <p className="text-xs text-gray-500">{c.hex || "-"}</p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500">Images: {c.images?.length || 0}</p>
                    </div>

                    {c.images?.length ? (
                      <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-2">
                        {c.images.map((url, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(url)}
                            className="border rounded-lg overflow-hidden hover:opacity-90"
                            title="View"
                          >
                            <img src={url} alt="color" className="w-full h-16 object-cover bg-gray-50" />
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="border rounded-xl p-10 text-center text-gray-500">No color variants.</div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* Info */}
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800">Product Info</h2>

            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <span className="text-gray-500">Slug:</span>{" "}
                <span className="font-semibold">{product.slug}</span>
              </p>

              <p>
                <span className="text-gray-500">Category:</span>{" "}
                <span className="font-semibold">{getCategoryLabel(product.category)}</span>
              </p>

              <p className="text-gray-500 text-xs mt-3 inline-flex items-center gap-2">
                <TagIcon size={14} /> Tags
              </p>

              {tagsLabel.length ? (
                <div className="flex flex-wrap gap-2">
                  {tagsLabel.map((t) => (
                    <Pill key={t} text={t} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No tags</p>
              )}

              {!metaLoading && (categoryOptions.length || tagOptions.length) ? (
                <p className="text-[11px] text-gray-400">
                  (Meta loaded: categories {categoryOptions.length}, tags {tagOptions.length})
                </p>
              ) : null}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-3">
            <h2 className="font-semibold text-gray-800">Pricing</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Base</span>
                <span className="font-semibold">৳ {product.basePrice.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="font-semibold">
                  {product.discountPrice ? <>৳ {product.discountPrice.toLocaleString()}</> : "-"}
                </span>
              </div>

              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-800 font-semibold">Final</span>
                <span className="text-gray-800 font-semibold">৳ {finalPrice.toLocaleString()}</span>
              </div>

              {/* ✅ Commission */}
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Commission</span>
                <span className="font-semibold">
                  {commissionPercent}% = ৳ {commissionAmount.toLocaleString()}
                </span>
              </div>

              {product.discountPrice ? (
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-700 bg-orange-100 border border-orange-200 px-2.5 py-1 rounded-full mt-2">
                  <BadgePercent size={14} />
                  {discountPercent}% OFF
                </div>
              ) : null}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-2">
            <h2 className="font-semibold text-gray-800">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description || "No description."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

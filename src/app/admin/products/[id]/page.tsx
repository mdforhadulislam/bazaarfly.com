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
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type ProductStatus = "active" | "inactive" | "out_of_stock" | "draft";

type ColorVariant = {
  name: string;
  hex?: string;
  images: string[];
};

type ProductDetails = {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;

  category: string;
  tags: string[];

  status: ProductStatus;
  stock: number;

  basePrice: number;
  discountPrice?: number | null;
  finalPrice: number;

  images: string[];
  colors: ColorVariant[];

  createdAt: string;
  updatedAt: string;

  lowStockAlertEnabled?: boolean;
  lowStockThreshold?: number;
};

/* ---------------- DUMMY FETCH ---------------- */
async function fakeFetchProduct(id: string): Promise<ProductDetails> {
  // Later: GET /api/v1/admin/products/:id
  const basePrice = 1490;
  const discountPrice = 1290;

  return {
    _id: id,
    name: "Premium Cotton Shirt",
    slug: "premium-cotton-shirt",
    sku: "BF-SHIRT-001",
    description:
      "High quality cotton shirt. Comfortable and durable. Perfect for daily wear.",

    category: "Fashion",
    tags: ["Trending", "Hot Deal"],

    status: "active",
    stock: 24,

    basePrice,
    discountPrice,
    finalPrice: discountPrice ?? basePrice,

    images: [
      "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      "https://res.cloudinary.com/demo/image/upload/balloons.jpg",
      "https://res.cloudinary.com/demo/image/upload/kitten_fighting.jpg",
    ],

    colors: [
      {
        name: "Red",
        hex: "#ff0000",
        images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
      },
      {
        name: "Black",
        hex: "#000000",
        images: ["https://res.cloudinary.com/demo/image/upload/balloons.jpg"],
      },
    ],

    createdAt: "29 Jan 2026, 04:15 PM",
    updatedAt: "30 Jan 2026, 11:10 AM",

    lowStockAlertEnabled: true,
    lowStockThreshold: 10,
  };
}

/* ---------------- UI HELPERS ---------------- */
function StatusBadge({ status }: { status: ProductStatus }) {
  const map: Record<ProductStatus, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-700",
    out_of_stock: "bg-red-100 text-red-700",
    draft: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${map[status]}`}
    >
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

/* ---------------- PAGE ---------------- */
export default function AdminProductDetailsPage() {
  const params = useParams();
  const id = String(params?.id || "");

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const data = await fakeFetchProduct(id);
      if (!mounted) return;
      setProduct(data);
      setActiveImage(data.images?.[0] || "");
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

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
    const ok = confirm("Delete this product? (demo)");
    if (!ok) return;
    // TODO: DELETE /api/v1/admin/products/:id
    alert("Deleted (demo).");
  };

  if (loading) {
    return (
      <div className="bg-white border rounded-xl p-10 text-center text-sm text-gray-500">
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

          <h1 className="text-2xl font-semibold text-gray-800 mt-2">
            {product.name}
          </h1>
          <p className="text-sm text-gray-500">
            ID: {product._id} • SKU: {product.sku}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/products/${product._id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-semibold hover:bg-gray-50"
          >
            <Pencil size={16} />
            Edit
          </Link>

          <Link
            href={`/admin/products/${product._id}/inventory`}
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
              <span className="text-xs font-semibold text-red-600">
                Low Stock
              </span>
            ) : (
              <span className="text-xs text-gray-500">Normal</span>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-1">
          <p className="text-sm text-gray-500">Stock</p>
          <p className="text-2xl font-semibold text-gray-800">{product.stock}</p>
          <p className="text-xs text-gray-500">
            Threshold: {product.lowStockThreshold ?? 10}
          </p>
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-1">
          <p className="text-sm text-gray-500">Price</p>
          <p className="text-2xl font-semibold text-gray-800">
            ৳ {product.finalPrice.toLocaleString()}
          </p>
          {product.discountPrice ? (
            <p className="text-xs text-gray-500">
              <span className="line-through">
                ৳ {product.basePrice.toLocaleString()}
              </span>{" "}
              • {discountPercent}% off
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              Base: ৳ {product.basePrice.toLocaleString()}
            </p>
          )}
        </div>

        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-1">
          <p className="text-sm text-gray-500">Dates</p>
          <p className="text-sm font-semibold text-gray-800">Created</p>
          <p className="text-xs text-gray-500">{product.createdAt}</p>
          <p className="text-sm font-semibold text-gray-800 mt-2">Updated</p>
          <p className="text-xs text-gray-500">{product.updatedAt}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Images + Variants */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800 inline-flex items-center gap-2">
              <ImageIcon size={18} className="text-orange-600" />
              Images
            </h2>

            {activeImage ? (
              <div className="border rounded-xl overflow-hidden bg-gray-50">
                <img
                  src={activeImage}
                  alt="Active"
                  className="w-full h-[320px] object-cover"
                />
              </div>
            ) : (
              <div className="border rounded-xl p-10 text-center text-gray-500">
                No images
              </div>
            )}

            {product.images?.length ? (
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {product.images.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(url)}
                    className={`border rounded-lg overflow-hidden ${
                      activeImage === url ? "ring-2 ring-orange-500" : ""
                    }`}
                    title="View image"
                  >
                    <img
                      src={url}
                      alt={`thumb-${idx}`}
                      className="w-full h-16 object-cover bg-gray-50"
                    />
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

            {product.colors.length === 0 ? (
              <div className="border rounded-xl p-10 text-center text-gray-500">
                No color variants.
              </div>
            ) : (
              <div className="space-y-4">
                {product.colors.map((c, idx) => (
                  <div key={idx} className="border rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-6 h-6 rounded-full border"
                          style={{ background: c.hex || "#fff" }}
                        />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {c.name || "Unnamed"}
                          </p>
                          <p className="text-xs text-gray-500">{c.hex || "-"}</p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500">
                        Images: {c.images.length}
                      </p>
                    </div>

                    {c.images.length ? (
                      <div className="mt-3 grid grid-cols-3 md:grid-cols-5 gap-2">
                        {c.images.map((url, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(url)}
                            className="border rounded-lg overflow-hidden hover:opacity-90"
                            title="View"
                          >
                            <img
                              src={url}
                              alt="color"
                              className="w-full h-16 object-cover bg-gray-50"
                            />
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Info */}
        <div className="space-y-6">
          {/* Category, tags */}
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800">Product Info</h2>

            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <span className="text-gray-500">Slug:</span>{" "}
                <span className="font-semibold">{product.slug}</span>
              </p>

              <p>
                <span className="text-gray-500">Category:</span>{" "}
                <span className="font-semibold">{product.category}</span>
              </p>

              <p className="text-gray-500 text-xs mt-3 inline-flex items-center gap-2">
                <TagIcon size={14} /> Tags
              </p>

              {product.tags.length ? (
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((t) => (
                    <Pill key={t} text={t} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No tags</p>
              )}
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="bg-white border rounded-xl p-6 shadow-sm space-y-3">
            <h2 className="font-semibold text-gray-800">Pricing</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Base</span>
                <span className="font-semibold">
                  ৳ {product.basePrice.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="font-semibold">
                  {product.discountPrice ? (
                    <>৳ {product.discountPrice.toLocaleString()}</>
                  ) : (
                    "-"
                  )}
                </span>
              </div>

              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-800 font-semibold">Final</span>
                <span className="text-gray-800 font-semibold">
                  ৳ {product.finalPrice.toLocaleString()}
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

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Package,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BadgePercent,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type ProductStatus = "active" | "inactive" | "out_of_stock" | "draft";

interface ProductRow {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  status: ProductStatus;
  basePrice: number;
  discountPrice?: number | null;
  finalPrice: number;
  stock: number;
  createdAt: string;
}

/* ---------------- DUMMY DATA ---------------- */
const products: ProductRow[] = [
  {
    _id: "pr1",
    name: "Premium Cotton Shirt",
    slug: "premium-cotton-shirt",
    sku: "BF-SHIRT-001",
    category: "Fashion",
    status: "active",
    basePrice: 1490,
    discountPrice: 1290,
    finalPrice: 1290,
    stock: 24,
    createdAt: "30 Jan 2026",
  },
  {
    _id: "pr2",
    name: "Wireless Headphone Pro",
    slug: "wireless-headphone-pro",
    sku: "BF-EL-009",
    category: "Electronics",
    status: "active",
    basePrice: 4990,
    discountPrice: null,
    finalPrice: 4990,
    stock: 8,
    createdAt: "29 Jan 2026",
  },
  {
    _id: "pr3",
    name: "Handmade Jute Bag",
    slug: "handmade-jute-bag",
    sku: "BF-HL-120",
    category: "Home & Living",
    status: "inactive",
    basePrice: 790,
    discountPrice: 650,
    finalPrice: 650,
    stock: 0,
    createdAt: "28 Jan 2026",
  },
  {
    _id: "pr4",
    name: "Organic Face Wash",
    slug: "organic-face-wash",
    sku: "BF-BEAUTY-22",
    category: "Beauty",
    status: "draft",
    basePrice: 590,
    discountPrice: null,
    finalPrice: 590,
    stock: 50,
    createdAt: "25 Jan 2026",
  },
];

/* ---------------- HELPERS ---------------- */
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

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0)
    return (
      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        0 (Out)
      </span>
    );
  if (stock <= 10)
    return (
      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
        Low ({stock})
      </span>
    );

  return (
    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
      {stock}
    </span>
  );
}

/* ---------------- PAGE ---------------- */
export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | ProductStatus>("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();

    return products
      .filter((p) => (status ? p.status === status : true))
      .filter((p) => (category ? p.category === category : true))
      .filter((p) => {
        if (!s) return true;
        return (
          p.name.toLowerCase().includes(s) ||
          p.slug.toLowerCase().includes(s) ||
          p.sku.toLowerCase().includes(s)
        );
      });
  }, [search, status, category]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * limit, safePage * limit);

  const handleDelete = (id: string) => {
    const ok = confirm("Delete this product? (placeholder)");
    if (!ok) return;
    alert(`Deleted product: ${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500">
            Manage products, pricing, and inventory
          </p>
        </div>

        <Link
          href="/admin/products/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6">
            <label className="text-xs font-semibold text-gray-600">Search</label>
            <div className="mt-1 flex items-center gap-2 border rounded-md px-3 py-2">
              <Search size={16} className="text-gray-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, slug, sku..."
                className="w-full text-sm outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-gray-600">Category</label>
            <div className="mt-1 flex items-center gap-2 border rounded-md px-3 py-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full text-sm outline-none bg-transparent"
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-gray-600">Status</label>
            <div className="mt-1 flex items-center gap-2 border rounded-md px-3 py-2">
              <Package size={16} className="text-gray-400" />
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as any);
                  setPage(1);
                }}
                className="w-full text-sm outline-none bg-transparent"
              >
                <option value="">All</option>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="out_of_stock">out_of_stock</option>
                <option value="draft">draft</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-gray-500">
            Showing <span className="font-semibold">{paged.length}</span> of{" "}
            <span className="font-semibold">{total}</span> products
          </div>

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="border rounded-md px-3 py-2 text-sm outline-none bg-white"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr className="text-left">
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paged.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.slug}</p>
                  </td>

                  <td className="py-3 px-4">{p.category}</td>

                  <td className="py-3 px-4 text-gray-700">{p.sku}</td>

                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      {p.discountPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            ৳ {p.finalPrice.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            ৳ {p.basePrice.toLocaleString()}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600">
                            <BadgePercent size={14} />
                            Deal
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold">
                          ৳ {p.finalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <StockBadge stock={p.stock} />
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={p.status} />
                  </td>

                  <td className="py-3 px-4 text-gray-500">{p.createdAt}</td>

                  <td className="py-3 px-4">
                    <div className="flex justify-end items-center gap-2">
                      <Link
                        href={`/admin/products/${p._id}`}
                        className="px-3 py-1.5 rounded-md border text-xs font-semibold hover:bg-gray-50 inline-flex items-center gap-2"
                      >
                        <Eye size={14} />
                        View
                      </Link>

                      <Link
                        href={`/admin/products/${p._id}/edit`}
                        className="px-3 py-1.5 rounded-md border text-xs font-semibold hover:bg-gray-50 inline-flex items-center gap-2"
                      >
                        <Pencil size={14} />
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(p._id)}
                        className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 inline-flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 border-t bg-white">
          <p className="text-xs text-gray-500">
            Page <span className="font-semibold">{safePage}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className={`px-3 py-2 rounded-md border text-sm font-semibold inline-flex items-center gap-2 ${
                safePage <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
              }`}
            >
              <ChevronLeft size={16} />
              Prev
            </button>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className={`px-3 py-2 rounded-md border text-sm font-semibold inline-flex items-center gap-2 ${
                safePage >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
              }`}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

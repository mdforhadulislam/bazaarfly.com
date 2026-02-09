"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
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
  Loader2,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type ProductStatus = "active" | "inactive" | "out_of_stock" | "draft";

interface ProductRow {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category: any;
  status: ProductStatus;
  basePrice: number;
  discountPrice?: number | null;
  finalPrice?: number;
  stock: number;

  commissionPercent?: number; // ✅ NEW
  commissionAmount?: number; // ✅ NEW

  createdAt: string;
}

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

/* ---------------- HELPERS ---------------- */
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

function buildQuery(params: Record<string, any>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const q = sp.toString();
  return q ? `?${q}` : "";
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function formatDate(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function getCategoryLabel(category: any) {
  if (!category) return "-";
  if (typeof category === "string") return category;
  return category?.name || category?.title || category?._id || "-";
}

function computeFinalPrice(p: ProductRow) {
  if (typeof p.finalPrice === "number") return p.finalPrice;
  if (p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.basePrice) return p.discountPrice;
  return p.basePrice;
}

function computeCommissionAmount(p: ProductRow) {
  const final = computeFinalPrice(p);
  const percent = Number(p.commissionPercent || 0);
  if (typeof p.commissionAmount === "number") return p.commissionAmount;
  if (percent <= 0) return 0;
  return Math.round((final * percent) / 100);
}

/* ---------------- PAGE ---------------- */
export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | ProductStatus>("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [items, setItems] = useState<ProductRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [loading, setLoading] = useState(false);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((p) => {
      const label = getCategoryLabel(p.category);
      const id = typeof p.category === "string" ? p.category : p.category?._id;
      if (id) map.set(String(id), label);
    });
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [items]);

  const fetchProducts = async (opts?: { resetPage?: boolean }) => {
    try {
      setLoading(true);

      const q = buildQuery({
        page: opts?.resetPage ? 1 : page,
        limit,
        search: search.trim(),
        status,
        category,
      });

      const res = await fetch(`/api/product${q}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.message || json?.msg || "Failed to fetch products");

      const list: ProductRow[] = json?.data?.items ?? [];
      const pg: Pagination =
        json?.data?.pagination ?? {
          total: list.length,
          page: 1,
          limit,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        };

      setItems(list);
      setPagination(pg);
      if (opts?.resetPage) setPage(1);
    } catch (e: any) {
      alert(e?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, status, category]);

  useEffect(() => {
    const t = setTimeout(() => fetchProducts({ resetPage: true }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const total = pagination.total;
  const totalPages = Math.max(1, pagination.totalPages);
  const safePage = Math.min(page, totalPages);

  const handleDelete = async (p: ProductRow) => {
    const ok = confirm(`Delete product: "${p.name}" ?`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/product/${encodeURIComponent(p.slug)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await safeJson(res);
      if (!res.ok) throw new Error(json?.message || json?.msg || "Failed to delete");

      setItems((prev) => prev.filter((x) => x._id !== p._id));
      fetchProducts();
    } catch (e: any) {
      alert(e?.message || "Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500">Manage products, pricing, and inventory</p>
        </div>

        <Link
          href="/admin/products/new"
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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, description..."
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
                  <option key={c.id} value={c.id}>
                    {c.label}
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
          <div className="text-xs text-gray-500 flex items-center gap-2">
            Showing <span className="font-semibold">{items.length}</span> of{" "}
            <span className="font-semibold">{total}</span> products
            {loading ? (
              <span className="inline-flex items-center gap-2 ml-2">
                <Loader2 size={14} className="animate-spin" /> Loading...
              </span>
            ) : null}
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
                <th className="py-3 px-4">Commission</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((p) => {
                const final = computeFinalPrice(p);
                const hasDeal =
                  p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.basePrice;

                const cPercent = Number(p.commissionPercent || 0);
                const cAmount = computeCommissionAmount(p);

                return (
                  <tr key={p._id} className="border-t">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.slug}</p>
                    </td>

                    <td className="py-3 px-4">{getCategoryLabel(p.category)}</td>
                    <td className="py-3 px-4 text-gray-700">{p.sku}</td>

                    <td className="py-3 px-4">
                      {hasDeal ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">৳ {final.toLocaleString()}</span>
                          <span className="text-xs text-gray-400 line-through">
                            ৳ {p.basePrice.toLocaleString()}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600">
                            <BadgePercent size={14} />
                            Deal
                          </span>
                        </div>
                      ) : (
                        <span className="font-semibold">৳ {final.toLocaleString()}</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {cPercent > 0 ? (
                        <span className="text-xs font-semibold text-gray-700">
                          {cPercent}% = ৳ {cAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <StockBadge stock={p.stock} />
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={p.status} />
                    </td>

                    <td className="py-3 px-4 text-gray-500">{formatDate(p.createdAt)}</td>

                    <td className="py-3 px-4">
                      <div className="flex justify-end items-center gap-2">
                        <Link
                          href={`/admin/products/${p.slug}`}
                          className="px-3 py-1.5 rounded-md border text-xs font-semibold hover:bg-gray-50 inline-flex items-center gap-2"
                        >
                          <Eye size={14} />
                          View
                        </Link>

                        <Link
                          href={`/admin/products/${p.slug}/edit`}
                          className="px-3 py-1.5 rounded-md border text-xs font-semibold hover:bg-gray-50 inline-flex items-center gap-2"
                        >
                          <Pencil size={14} />
                          Edit
                        </Link>

                        <button
                          onClick={() => handleDelete(p)}
                          className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 inline-flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-gray-500">
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
              disabled={safePage <= 1 || loading}
              className={`px-3 py-2 rounded-md border text-sm font-semibold inline-flex items-center gap-2 ${
                safePage <= 1 || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
              }`}
            >
              <ChevronLeft size={16} />
              Prev
            </button>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages || loading}
              className={`px-3 py-2 rounded-md border text-sm font-semibold inline-flex items-center gap-2 ${
                safePage >= totalPages || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
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

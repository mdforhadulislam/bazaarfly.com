"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Eye,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type AffiliateOrderRow = {
  _id: string;
  orderNumber: string;

  customerName?: string;
  customerPhone?: string;

  itemsCount: number;
  total: number;

  status: OrderStatus;
  note?: string;

  createdAt: string;
  updatedAt: string;
};

/* ---------------- DUMMY DATA ---------------- */
const DUMMY_ORDERS: AffiliateOrderRow[] = [
  {
    _id: "o1",
    orderNumber: "ORD-1001",
    customerName: "Shirin Akter",
    customerPhone: "+8801712345678",
    itemsCount: 2,
    total: 2590,
    status: "delivered",
    note: "From Facebook campaign",
    createdAt: "2026-01-30T11:20:00.000Z",
    updatedAt: "2026-01-31T15:30:00.000Z",
  },
  {
    _id: "o2",
    orderNumber: "ORD-1015",
    customerName: "Hasan Mahmud",
    customerPhone: "+8801811223344",
    itemsCount: 1,
    total: 1490,
    status: "processing",
    note: "COD order",
    createdAt: "2026-02-01T18:05:00.000Z",
    updatedAt: "2026-02-02T09:10:00.000Z",
  },
  {
    _id: "o3",
    orderNumber: "ORD-1022",
    customerName: "Mitu Roy",
    customerPhone: "+8801911002200",
    itemsCount: 3,
    total: 3890,
    status: "pending",
    note: "",
    createdAt: "2026-02-02T20:40:00.000Z",
    updatedAt: "2026-02-02T20:40:00.000Z",
  },
];

/* ---------------- HELPERS ---------------- */
const fmt = (d?: string) => (d ? new Date(d).toLocaleString() : "-");

const statusBadge = (s: OrderStatus) => {
  if (s === "delivered") return "bg-green-100 text-green-800";
  if (s === "processing") return "bg-blue-100 text-blue-800";
  if (s === "shipped") return "bg-purple-100 text-purple-800";
  if (s === "cancelled") return "bg-red-100 text-red-800";
  return "bg-yellow-100 text-yellow-800";
};

function Modal({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center p-3">
      <div className="w-full max-w-2xl bg-white rounded-2xl border shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border hover:bg-gray-50 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function AffiliateOrdersPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [rows, setRows] = useState<AffiliateOrderRow[]>(DUMMY_ORDERS);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<OrderStatus | "all">("all");

  // modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [active, setActive] = useState<AffiliateOrderRow | null>(null);

  const [form, setForm] = useState({
    orderNumber: "",
    customerName: "",
    customerPhone: "",
    itemsCount: 1,
    total: 0,
    status: "pending" as OrderStatus,
    note: "",
  });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    let list = rows;
    if (tab !== "all") list = list.filter((r) => r.status === tab);

    if (!s) return list;

    return list.filter((r) => {
      return (
        r.orderNumber.toLowerCase().includes(s) ||
        (r.customerName || "").toLowerCase().includes(s) ||
        (r.customerPhone || "").toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s)
      );
    });
  }, [q, rows, tab]);

  const totals = useMemo(() => {
    const totalOrders = filtered.length;
    const totalRevenue = filtered.reduce((a, b) => a + (Number(b.total) || 0), 0);
    return { totalOrders, totalRevenue };
  }, [filtered]);

  const openCreate = () => {
    setForm({
      orderNumber: "",
      customerName: "",
      customerPhone: "",
      itemsCount: 1,
      total: 0,
      status: "pending",
      note: "",
    });
    setCreateOpen(true);
  };

  const createRow = () => {
    const orderNumber = form.orderNumber.trim();
    if (!orderNumber) return;

    const newRow: AffiliateOrderRow = {
      _id: `o_${Date.now()}`,
      orderNumber,
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      itemsCount: Number(form.itemsCount) || 1,
      total: Number(form.total) || 0,
      status: form.status,
      note: form.note.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRows((p) => [newRow, ...p]);
    setCreateOpen(false);
  };

  const openView = (r: AffiliateOrderRow) => {
    setActive(r);
    setViewOpen(true);
  };

  const openEdit = (r: AffiliateOrderRow) => {
    setActive(r);
    setForm({
      orderNumber: r.orderNumber,
      customerName: r.customerName || "",
      customerPhone: r.customerPhone || "",
      itemsCount: r.itemsCount,
      total: r.total,
      status: r.status,
      note: r.note || "",
    });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!active) return;

    const orderNumber = form.orderNumber.trim();
    if (!orderNumber) return;

    setRows((p) =>
      p.map((x) =>
        x._id === active._id
          ? {
              ...x,
              orderNumber,
              customerName: form.customerName.trim(),
              customerPhone: form.customerPhone.trim(),
              itemsCount: Number(form.itemsCount) || 1,
              total: Number(form.total) || 0,
              status: form.status,
              note: form.note.trim(),
              updatedAt: new Date().toISOString(),
            }
          : x
      )
    );
    setEditOpen(false);
    setActive(null);
  };

  const openDelete = (r: AffiliateOrderRow) => {
    setActive(r);
    setDeleteOpen(true);
  };

  const doDelete = () => {
    if (!active) return;
    setRows((p) => p.filter((x) => x._id !== active._id));
    setDeleteOpen(false);
    setActive(null);
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/affiliates/${id}`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
          >
            <ArrowLeft size={18} /> Back
          </Link>

          <div>
            <h1 className="text-xl font-bold text-gray-900">Affiliate Orders</h1>
            <p className="text-sm text-gray-600">
              View all orders for this affiliate. Create / edit / delete by modal.
            </p>
            <p className="text-xs text-gray-500">Affiliate ID: {id}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search order / customer / phone..."
              className="w-[320px] max-w-full pl-10 pr-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
          >
            <Plus size={18} /> Create Order
          </button>
        </div>
      </div>

      {/* Tabs + Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["pending", "Pending"],
              ["processing", "Processing"],
              ["shipped", "Shipped"],
              ["delivered", "Delivered"],
              ["cancelled", "Cancelled"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                tab === key
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-white border rounded-2xl px-4 py-3 flex flex-wrap gap-4">
          <p className="text-sm text-gray-700">
            Orders: <span className="font-semibold">{totals.totalOrders}</span>
          </p>
          <p className="text-sm text-gray-700">
            Total:{" "}
            <span className="font-semibold">
              ৳{Number(totals.totalRevenue || 0).toLocaleString()}
            </span>
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Order</th>
                <th className="text-left px-4 py-3 font-semibold">Customer</th>
                <th className="text-right px-4 py-3 font-semibold">Items</th>
                <th className="text-right px-4 py-3 font-semibold">Total</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Created</th>
                <th className="text-left px-4 py-3 font-semibold">Updated</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={8}>
                    No orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/60 align-top">
                    {/* Order */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{r.orderNumber}</p>
                      <p className="text-xs text-gray-500">DB: {r._id}</p>
                      {r.note ? (
                        <p className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
                          Note: {r.note}
                        </p>
                      ) : null}
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">
                        {r.customerName || "-"}
                      </p>
                      <p className="text-xs text-gray-600">{r.customerPhone || "-"}</p>
                    </td>

                    {/* Items */}
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {Number(r.itemsCount || 0).toLocaleString()}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      ৳{Number(r.total || 0).toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(
                          r.status
                        )}`}
                      >
                        {r.status}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3 text-gray-700">{fmt(r.createdAt)}</td>

                    {/* Updated */}
                    <td className="px-4 py-3 text-gray-700">{fmt(r.updatedAt)}</td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => openView(r)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50 transition"
                        >
                          <Eye size={16} /> View
                        </button>

                        <button
                          onClick={() => openEdit(r)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-orange-50 transition"
                        >
                          <Pencil size={16} /> Edit
                        </button>

                        <button
                          onClick={() => openDelete(r)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      <Modal title="Order Details (View)" open={viewOpen} onClose={() => setViewOpen(false)}>
        {!active ? (
          <p className="text-sm text-gray-600">No data</p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl border bg-gray-50">
                <p className="text-xs text-gray-500">Order</p>
                <p className="font-semibold text-gray-900">{active.orderNumber}</p>
                <p className="text-xs text-gray-600">DB: {active._id}</p>
              </div>

              <div className="p-4 rounded-2xl border bg-gray-50">
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-semibold text-gray-900">{active.status}</p>
                <p className="text-xs text-gray-600">Updated: {fmt(active.updatedAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl border">
                <p className="text-xs text-gray-500">Customer</p>
                <p className="font-semibold text-gray-900">{active.customerName || "-"}</p>
                <p className="text-xs text-gray-600">{active.customerPhone || "-"}</p>
              </div>

              <div className="p-4 rounded-2xl border">
                <p className="text-xs text-gray-500">Items</p>
                <p className="font-semibold text-gray-900">{active.itemsCount}</p>
              </div>

              <div className="p-4 rounded-2xl border">
                <p className="text-xs text-gray-500">Total</p>
                <p className="font-semibold text-gray-900">
                  ৳{Number(active.total || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border">
              <p className="text-xs text-gray-500">Note</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{active.note || "-"}</p>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setViewOpen(false)}
                className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal title="Create Order" open={createOpen} onClose={() => setCreateOpen(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Order Number *</label>
              <input
                value={form.orderNumber}
                onChange={(e) => setForm((p) => ({ ...p, orderNumber: e.target.value }))}
                placeholder="ORD-1200"
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as OrderStatus }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="pending">pending</option>
                <option value="processing">processing</option>
                <option value="shipped">shipped</option>
                <option value="delivered">delivered</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Customer Name</label>
              <input
                value={form.customerName}
                onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Customer Phone</label>
              <input
                value={form.customerPhone}
                onChange={(e) => setForm((p) => ({ ...p, customerPhone: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Items Count</label>
              <input
                type="number"
                value={form.itemsCount}
                onChange={(e) => setForm((p) => ({ ...p, itemsCount: Number(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Total</label>
              <input
                type="number"
                value={form.total}
                onChange={(e) => setForm((p) => ({ ...p, total: Number(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700">Note</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              rows={3}
              className="w-full mt-1 px-3 py-2 rounded-2xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              onClick={() => setCreateOpen(false)}
              className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={createRow}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
            >
              Create
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal title="Edit Order" open={editOpen} onClose={() => setEditOpen(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Order Number *</label>
              <input
                value={form.orderNumber}
                onChange={(e) => setForm((p) => ({ ...p, orderNumber: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as OrderStatus }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="pending">pending</option>
                <option value="processing">processing</option>
                <option value="shipped">shipped</option>
                <option value="delivered">delivered</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Customer Name</label>
              <input
                value={form.customerName}
                onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Customer Phone</label>
              <input
                value={form.customerPhone}
                onChange={(e) => setForm((p) => ({ ...p, customerPhone: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Items Count</label>
              <input
                type="number"
                value={form.itemsCount}
                onChange={(e) => setForm((p) => ({ ...p, itemsCount: Number(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Total</label>
              <input
                type="number"
                value={form.total}
                onChange={(e) => setForm((p) => ({ ...p, total: Number(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700">Note</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              rows={3}
              className="w-full mt-1 px-3 py-2 rounded-2xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal title="Delete Order" open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{active?.orderNumber}</span>?
            <br />
            This cannot be undone.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              onClick={() => setDeleteOpen(false)}
              className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={doDelete}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

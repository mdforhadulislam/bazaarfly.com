"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, X, Search } from "lucide-react";

type CommissionStatus = "pending" | "approved" | "reversed";

type CommissionRow = {
  _id: string;
  orderNumber?: string;
  orderId?: string;
  percent: number;
  amount: number;
  status: CommissionStatus;
  createdAt: string;
};

const DUMMY: CommissionRow[] = [
  {
    _id: "c1",
    orderNumber: "ORD-1001",
    percent: 5,
    amount: 130,
    status: "approved",
    createdAt: "2026-01-31T10:10:00.000Z",
  },
  {
    _id: "c2",
    orderNumber: "ORD-1015",
    percent: 5,
    amount: 74.5,
    status: "pending",
    createdAt: "2026-02-02T07:10:00.000Z",
  },
];

const fmt = (d?: string) => (d ? new Date(d).toLocaleString() : "-");

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

export default function AffiliateCommissionsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [rows, setRows] = useState<CommissionRow[]>(DUMMY);
  const [q, setQ] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [active, setActive] = useState<CommissionRow | null>(null);

  const [form, setForm] = useState({
    orderNumber: "",
    percent: 5,
    amount: 0,
    status: "pending" as CommissionStatus,
  });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => {
      return (
        (r.orderNumber || "").toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s) ||
        r._id.toLowerCase().includes(s)
      );
    });
  }, [q, rows]);

  const openCreate = () => {
    setForm({ orderNumber: "", percent: 5, amount: 0, status: "pending" });
    setCreateOpen(true);
  };

  const createRow = () => {
    const newRow: CommissionRow = {
      _id: `c_${Date.now()}`,
      orderNumber: form.orderNumber.trim() || "-",
      percent: Number(form.percent) || 0,
      amount: Number(form.amount) || 0,
      status: form.status,
      createdAt: new Date().toISOString(),
    };
    setRows((p) => [newRow, ...p]);
    setCreateOpen(false);
  };

  const openEdit = (r: CommissionRow) => {
    setActive(r);
    setForm({
      orderNumber: r.orderNumber || "",
      percent: r.percent,
      amount: r.amount,
      status: r.status,
    });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!active) return;
    setRows((p) =>
      p.map((x) =>
        x._id === active._id
          ? {
              ...x,
              orderNumber: form.orderNumber,
              percent: Number(form.percent) || 0,
              amount: Number(form.amount) || 0,
              status: form.status,
            }
          : x
      )
    );
    setEditOpen(false);
    setActive(null);
  };

  const openDelete = (r: CommissionRow) => {
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/affiliates/${id}`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
          >
            <ArrowLeft size={18} /> Back
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Commissions</h1>
            <p className="text-sm text-gray-600">Affiliate ID: {id}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search commission..."
              className="w-[280px] max-w-full pl-10 pr-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
          >
            <Plus size={18} /> Create
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Order</th>
                <th className="text-left px-4 py-3 font-semibold">Percent</th>
                <th className="text-right px-4 py-3 font-semibold">Amount</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={6}>
                    No commissions found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {r.orderNumber || r.orderId || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r.percent}%</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      ৳{Number(r.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{fmt(r.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
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

      {/* Create Modal */}
      <Modal title="Create Commission" open={createOpen} onClose={() => setCreateOpen(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Order Number</label>
              <input
                value={form.orderNumber}
                onChange={(e) => setForm((p) => ({ ...p, orderNumber: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="ORD-1001"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as CommissionStatus }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="pending">pending</option>
                <option value="approved">approved</option>
                <option value="reversed">reversed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Percent</label>
              <input
                type="number"
                value={form.percent}
                onChange={(e) => setForm((p) => ({ ...p, percent: Number(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Amount</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
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
      <Modal title="Edit Commission" open={editOpen} onClose={() => setEditOpen(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Order Number</label>
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
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as CommissionStatus }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="pending">pending</option>
                <option value="approved">approved</option>
                <option value="reversed">reversed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Percent</label>
              <input
                type="number"
                value={form.percent}
                onChange={(e) => setForm((p) => ({ ...p, percent: Number(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Amount</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
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
      <Modal title="Delete Commission" open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete this commission?
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

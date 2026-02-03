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
  CheckCircle,
  XCircle,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type PayoutStatus = "pending" | "paid" | "rejected";

type PayoutRow = {
  _id: string;
  payoutId: string; // friendly id
  amount: number;
  method: "bKash" | "Nagad" | "Bank" | "PayPal" | "Other";
  account?: string; // bkash/nagad number or bank acc
  status: PayoutStatus;

  requestedAt: string;
  paidAt?: string;

  adminNote?: string;
};

/* ---------------- DUMMY DATA ---------------- */
const DUMMY_PAYOUTS: PayoutRow[] = [
  {
    _id: "p1",
    payoutId: "PO-202601-0001",
    amount: 3000,
    method: "bKash",
    account: "+8801711000001",
    status: "paid",
    requestedAt: "2026-01-27T08:10:00.000Z",
    paidAt: "2026-01-28T09:40:00.000Z",
    adminNote: "Paid successfully",
  },
  {
    _id: "p2",
    payoutId: "PO-202602-0002",
    amount: 1500,
    method: "Nagad",
    account: "+8801811000002",
    status: "pending",
    requestedAt: "2026-02-02T10:15:00.000Z",
    paidAt: "",
    adminNote: "",
  },
  {
    _id: "p3",
    payoutId: "PO-202602-0003",
    amount: 1200,
    method: "Bank",
    account: "AC: 1234567890 (DBBL)",
    status: "rejected",
    requestedAt: "2026-02-01T07:00:00.000Z",
    paidAt: "",
    adminNote: "KYC not completed",
  },
];

/* ---------------- HELPERS ---------------- */
const fmt = (d?: string) => (d ? new Date(d).toLocaleString() : "-");

const badge = (s: PayoutStatus) => {
  if (s === "paid") return "bg-green-100 text-green-800";
  if (s === "rejected") return "bg-red-100 text-red-800";
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
export default function AffiliatePayoutsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [rows, setRows] = useState<PayoutRow[]>(DUMMY_PAYOUTS);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<PayoutStatus | "all">("all");

  // modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [decideOpen, setDecideOpen] = useState(false);

  const [active, setActive] = useState<PayoutRow | null>(null);

  const [form, setForm] = useState({
    payoutId: "",
    amount: 0,
    method: "bKash" as PayoutRow["method"],
    account: "",
    status: "pending" as PayoutStatus,
    adminNote: "",
  });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    let list = rows;
    if (tab !== "all") list = list.filter((r) => r.status === tab);

    if (!s) return list;

    return list.filter((r) => {
      return (
        r.payoutId.toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s) ||
        r.method.toLowerCase().includes(s) ||
        (r.account || "").toLowerCase().includes(s)
      );
    });
  }, [q, rows, tab]);

  const summary = useMemo(() => {
    const totalRequested = filtered.reduce((a, b) => a + (Number(b.amount) || 0), 0);
    const totalPaid = filtered
      .filter((x) => x.status === "paid")
      .reduce((a, b) => a + (Number(b.amount) || 0), 0);
    const pendingCount = filtered.filter((x) => x.status === "pending").length;
    return { totalRequested, totalPaid, pendingCount };
  }, [filtered]);

  const openCreate = () => {
    setForm({
      payoutId: `PO-${new Date().toISOString().slice(0, 7).replace("-", "")}-${String(
        Math.floor(Math.random() * 9999)
      ).padStart(4, "0")}`,
      amount: 0,
      method: "bKash",
      account: "",
      status: "pending",
      adminNote: "",
    });
    setCreateOpen(true);
  };

  const createRow = () => {
    if (!form.payoutId.trim()) return;

    const newRow: PayoutRow = {
      _id: `p_${Date.now()}`,
      payoutId: form.payoutId.trim(),
      amount: Number(form.amount) || 0,
      method: form.method,
      account: form.account.trim(),
      status: form.status,
      requestedAt: new Date().toISOString(),
      paidAt: form.status === "paid" ? new Date().toISOString() : "",
      adminNote: form.adminNote.trim(),
    };

    setRows((p) => [newRow, ...p]);
    setCreateOpen(false);
  };

  const openView = (r: PayoutRow) => {
    setActive(r);
    setViewOpen(true);
  };

  const openEdit = (r: PayoutRow) => {
    setActive(r);
    setForm({
      payoutId: r.payoutId,
      amount: r.amount,
      method: r.method,
      account: r.account || "",
      status: r.status,
      adminNote: r.adminNote || "",
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
              payoutId: form.payoutId.trim(),
              amount: Number(form.amount) || 0,
              method: form.method,
              account: form.account.trim(),
              status: form.status,
              adminNote: form.adminNote.trim(),
              paidAt:
                form.status === "paid"
                  ? x.paidAt || new Date().toISOString()
                  : form.status === "pending"
                  ? ""
                  : "",
            }
          : x
      )
    );

    setEditOpen(false);
    setActive(null);
  };

  const openDelete = (r: PayoutRow) => {
    setActive(r);
    setDeleteOpen(true);
  };

  const doDelete = () => {
    if (!active) return;
    setRows((p) => p.filter((x) => x._id !== active._id));
    setDeleteOpen(false);
    setActive(null);
  };

  // Admin decision modal for pending requests
  const openDecide = (r: PayoutRow) => {
    setActive(r);
    setForm({
      payoutId: r.payoutId,
      amount: r.amount,
      method: r.method,
      account: r.account || "",
      status: r.status,
      adminNote: r.adminNote || "",
    });
    setDecideOpen(true);
  };

  const markPaid = () => {
    if (!active) return;
    setRows((p) =>
      p.map((x) =>
        x._id === active._id
          ? {
              ...x,
              status: "paid",
              paidAt: new Date().toISOString(),
              adminNote: form.adminNote.trim() || x.adminNote,
            }
          : x
      )
    );
    setDecideOpen(false);
    setActive(null);
  };

  const markRejected = () => {
    if (!active) return;
    setRows((p) =>
      p.map((x) =>
        x._id === active._id
          ? {
              ...x,
              status: "rejected",
              paidAt: "",
              adminNote: form.adminNote.trim() || "Rejected by admin",
            }
          : x
      )
    );
    setDecideOpen(false);
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
            <h1 className="text-xl font-bold text-gray-900">Affiliate Payouts</h1>
            <p className="text-sm text-gray-600">
              View + Create/Edit/Delete payout entries. Pending requests can be Paid/Rejected in modal.
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
              placeholder="Search payoutId / method / status..."
              className="w-[320px] max-w-full pl-10 pr-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
          >
            <Plus size={18} /> Create Payout
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
              ["paid", "Paid"],
              ["rejected", "Rejected"],
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
            Requested:{" "}
            <span className="font-semibold">
              ৳{Number(summary.totalRequested || 0).toLocaleString()}
            </span>
          </p>
          <p className="text-sm text-gray-700">
            Paid:{" "}
            <span className="font-semibold">
              ৳{Number(summary.totalPaid || 0).toLocaleString()}
            </span>
          </p>
          <p className="text-sm text-gray-700">
            Pending: <span className="font-semibold">{summary.pendingCount}</span>
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Payout</th>
                <th className="text-right px-4 py-3 font-semibold">Amount</th>
                <th className="text-left px-4 py-3 font-semibold">Method</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Requested</th>
                <th className="text-left px-4 py-3 font-semibold">Paid</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={7}>
                    No payouts found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/60 align-top">
                    {/* Payout */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{r.payoutId}</p>
                      <p className="text-xs text-gray-500">DB: {r._id}</p>
                      {r.account ? (
                        <p className="text-xs text-gray-700 mt-1">
                          Account: <span className="font-semibold">{r.account}</span>
                        </p>
                      ) : null}
                      {r.adminNote ? (
                        <p className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
                          Note: {r.adminNote}
                        </p>
                      ) : null}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      ৳{Number(r.amount || 0).toLocaleString()}
                    </td>

                    {/* Method */}
                    <td className="px-4 py-3 text-gray-700">{r.method}</td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${badge(
                          r.status
                        )}`}
                      >
                        {r.status}
                      </span>
                    </td>

                    {/* Requested */}
                    <td className="px-4 py-3 text-gray-700">{fmt(r.requestedAt)}</td>

                    {/* Paid */}
                    <td className="px-4 py-3 text-gray-700">{r.paidAt ? fmt(r.paidAt) : "-"}</td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => openView(r)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50 transition"
                        >
                          <Eye size={16} /> View
                        </button>

                        {r.status === "pending" ? (
                          <button
                            onClick={() => openDecide(r)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition"
                          >
                            <CheckCircle size={16} /> Decide
                          </button>
                        ) : null}

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
      <Modal title="Payout Details (View)" open={viewOpen} onClose={() => setViewOpen(false)}>
        {!active ? (
          <p className="text-sm text-gray-600">No data</p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl border bg-gray-50">
                <p className="text-xs text-gray-500">Payout</p>
                <p className="font-semibold text-gray-900">{active.payoutId}</p>
                <p className="text-xs text-gray-600">DB: {active._id}</p>
              </div>
              <div className="p-4 rounded-2xl border bg-gray-50">
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-semibold text-gray-900">{active.status}</p>
                <p className="text-xs text-gray-600">Paid At: {active.paidAt ? fmt(active.paidAt) : "-"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl border">
                <p className="text-xs text-gray-500">Amount</p>
                <p className="font-semibold text-gray-900">
                  ৳{Number(active.amount || 0).toLocaleString()}
                </p>
              </div>

              <div className="p-4 rounded-2xl border">
                <p className="text-xs text-gray-500">Method</p>
                <p className="font-semibold text-gray-900">{active.method}</p>
              </div>

              <div className="p-4 rounded-2xl border">
                <p className="text-xs text-gray-500">Account</p>
                <p className="font-semibold text-gray-900">{active.account || "-"}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border">
              <p className="text-xs text-gray-500">Admin Note</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{active.adminNote || "-"}</p>
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

      {/* Decide Modal (Pay / Reject) */}
      <Modal
        title="Decide Payout (Pay / Reject)"
        open={decideOpen}
        onClose={() => setDecideOpen(false)}
      >
        {!active ? (
          <p className="text-sm text-gray-600">No data</p>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border bg-gray-50">
              <p className="text-xs text-gray-500">Request</p>
              <p className="text-sm font-semibold text-gray-900">
                {active.payoutId} • ৳{Number(active.amount || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-600">
                Method: {active.method} • Account: {active.account || "-"}
              </p>
              <p className="text-xs text-gray-600">Requested: {fmt(active.requestedAt)}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Admin Note</label>
              <textarea
                value={form.adminNote}
                onChange={(e) => setForm((p) => ({ ...p, adminNote: e.target.value }))}
                rows={4}
                placeholder="Write note for payout decision..."
                className="w-full mt-1 px-3 py-2 rounded-2xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                onClick={() => setDecideOpen(false)}
                className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={markRejected}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
              >
                <XCircle size={18} /> Reject
              </button>

              <button
                onClick={markPaid}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
              >
                <CheckCircle size={18} /> Mark Paid
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal title="Create Payout" open={createOpen} onClose={() => setCreateOpen(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Payout ID</label>
              <input
                value={form.payoutId}
                onChange={(e) => setForm((p) => ({ ...p, payoutId: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as PayoutStatus }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="pending">pending</option>
                <option value="paid">paid</option>
                <option value="rejected">rejected</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Amount</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Method</label>
              <select
                value={form.method}
                onChange={(e) => setForm((p) => ({ ...p, method: e.target.value as any }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Bank">Bank</option>
                <option value="PayPal">PayPal</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700">Account / Number</label>
            <input
              value={form.account}
              onChange={(e) => setForm((p) => ({ ...p, account: e.target.value }))}
              className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              placeholder="+8801XXXXXXXXX / bank acc"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700">Admin Note</label>
            <textarea
              value={form.adminNote}
              onChange={(e) => setForm((p) => ({ ...p, adminNote: e.target.value }))}
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
      <Modal title="Edit Payout" open={editOpen} onClose={() => setEditOpen(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Payout ID</label>
              <input
                value={form.payoutId}
                onChange={(e) => setForm((p) => ({ ...p, payoutId: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as PayoutStatus }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="pending">pending</option>
                <option value="paid">paid</option>
                <option value="rejected">rejected</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Amount</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Method</label>
              <select
                value={form.method}
                onChange={(e) => setForm((p) => ({ ...p, method: e.target.value as any }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Bank">Bank</option>
                <option value="PayPal">PayPal</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700">Account / Number</label>
            <input
              value={form.account}
              onChange={(e) => setForm((p) => ({ ...p, account: e.target.value }))}
              className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700">Admin Note</label>
            <textarea
              value={form.adminNote}
              onChange={(e) => setForm((p) => ({ ...p, adminNote: e.target.value }))}
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
      <Modal title="Delete Payout" open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{active?.payoutId}</span>?
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

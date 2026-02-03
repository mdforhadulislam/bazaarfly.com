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
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type TxType = "credit" | "debit";
type TxStatus = "pending" | "success" | "failed" | "reversed";

type WalletTxRow = {
  _id: string;
  txId: string; // friendly id
  type: TxType;
  status: TxStatus;

  amount: number;

  source?: "commission" | "payout" | "adjustment" | "refund" | "other";
  reference?: string; // orderNumber / payoutId / note

  note?: string;
  createdAt: string;
  updatedAt: string;
};

type WalletSummary = {
  openingBalance: number;
  totalCredit: number;
  totalDebit: number;
  currentBalance: number;
};

/* ---------------- DUMMY DATA ---------------- */
const DUMMY_TX: WalletTxRow[] = [
  {
    _id: "t1",
    txId: "TX-202601-0001",
    type: "credit",
    status: "success",
    amount: 250,
    source: "commission",
    reference: "ORD-1001",
    note: "5% commission",
    createdAt: "2026-01-31T10:30:00.000Z",
    updatedAt: "2026-01-31T10:30:00.000Z",
  },
  {
    _id: "t2",
    txId: "TX-202601-0002",
    type: "credit",
    status: "success",
    amount: 175,
    source: "commission",
    reference: "ORD-1015",
    note: "5% commission",
    createdAt: "2026-02-01T09:05:00.000Z",
    updatedAt: "2026-02-01T09:05:00.000Z",
  },
  {
    _id: "t3",
    txId: "TX-202602-0003",
    type: "debit",
    status: "success",
    amount: 500,
    source: "payout",
    reference: "PO-202601-0001",
    note: "Payout to bKash",
    createdAt: "2026-02-01T14:20:00.000Z",
    updatedAt: "2026-02-01T14:20:00.000Z",
  },
  {
    _id: "t4",
    txId: "TX-202602-0004",
    type: "credit",
    status: "pending",
    amount: 90,
    source: "commission",
    reference: "ORD-1022",
    note: "Pending commission",
    createdAt: "2026-02-02T20:45:00.000Z",
    updatedAt: "2026-02-02T20:45:00.000Z",
  },
];

/* ---------------- HELPERS ---------------- */
const fmt = (d?: string) => (d ? new Date(d).toLocaleString() : "-");

const badge = (s: TxStatus) => {
  if (s === "success") return "bg-green-100 text-green-800";
  if (s === "failed") return "bg-red-100 text-red-800";
  if (s === "reversed") return "bg-purple-100 text-purple-800";
  return "bg-yellow-100 text-yellow-800";
};

const txIcon = (t: TxType) =>
  t === "credit" ? (
    <ArrowDownCircle size={18} className="text-gray-400" />
  ) : (
    <ArrowUpCircle size={18} className="text-gray-400" />
  );

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
      <div className="w-full max-w-3xl bg-white rounded-2xl border shadow-xl overflow-hidden">
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
export default function AffiliateWalletPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [rows, setRows] = useState<WalletTxRow[]>(DUMMY_TX);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<TxType | "all">("all");

  // modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [active, setActive] = useState<WalletTxRow | null>(null);

  const [form, setForm] = useState({
    txId: "",
    type: "credit" as TxType,
    status: "pending" as TxStatus,
    amount: 0,
    source: "other" as NonNullable<WalletTxRow["source"]>,
    reference: "",
    note: "",
  });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    let list = rows;
    if (tab !== "all") list = list.filter((r) => r.type === tab);

    if (!s) return list;

    return list.filter((r) => {
      return (
        r.txId.toLowerCase().includes(s) ||
        r.type.toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s) ||
        (r.source || "").toLowerCase().includes(s) ||
        (r.reference || "").toLowerCase().includes(s) ||
        (r.note || "").toLowerCase().includes(s)
      );
    });
  }, [q, rows, tab]);

  const summary = useMemo<WalletSummary>(() => {
    const openingBalance = 0;

    const successOnly = filtered.filter((x) => x.status === "success");

    const totalCredit = successOnly
      .filter((x) => x.type === "credit")
      .reduce((a, b) => a + (Number(b.amount) || 0), 0);

    const totalDebit = successOnly
      .filter((x) => x.type === "debit")
      .reduce((a, b) => a + (Number(b.amount) || 0), 0);

    const currentBalance = openingBalance + totalCredit - totalDebit;

    return { openingBalance, totalCredit, totalDebit, currentBalance };
  }, [filtered]);

  const openCreate = () => {
    setForm({
      txId: `TX-${new Date().toISOString().slice(0, 7).replace("-", "")}-${String(
        Math.floor(Math.random() * 9999)
      ).padStart(4, "0")}`,
      type: "credit",
      status: "pending",
      amount: 0,
      source: "other",
      reference: "",
      note: "",
    });
    setCreateOpen(true);
  };

  const createRow = () => {
    if (!form.txId.trim()) return;

    const newRow: WalletTxRow = {
      _id: `t_${Date.now()}`,
      txId: form.txId.trim(),
      type: form.type,
      status: form.status,
      amount: Number(form.amount) || 0,
      source: form.source,
      reference: form.reference.trim(),
      note: form.note.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRows((p) => [newRow, ...p]);
    setCreateOpen(false);
  };

  const openView = (r: WalletTxRow) => {
    setActive(r);
    setViewOpen(true);
  };

  const openEdit = (r: WalletTxRow) => {
    setActive(r);
    setForm({
      txId: r.txId,
      type: r.type,
      status: r.status,
      amount: r.amount,
      source: (r.source || "other") as any,
      reference: r.reference || "",
      note: r.note || "",
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
              txId: form.txId.trim(),
              type: form.type,
              status: form.status,
              amount: Number(form.amount) || 0,
              source: form.source,
              reference: form.reference.trim(),
              note: form.note.trim(),
              updatedAt: new Date().toISOString(),
            }
          : x
      )
    );

    setEditOpen(false);
    setActive(null);
  };

  const openDelete = (r: WalletTxRow) => {
    setActive(r);
    setDeleteOpen(true);
  };

  const doDelete = () => {
    if (!active) return;
    setRows((p) => p.filter((x) => x._id !== active._id));
    setDeleteOpen(false);
    setActive(null);
  };

  const resetDemo = () => setRows(DUMMY_TX);

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
            <h1 className="text-xl font-bold text-gray-900">Affiliate Wallet</h1>
            <p className="text-sm text-gray-600">
              Wallet ledger (credit/debit). Create/Edit/Delete uses modal. Balance uses success transactions.
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
              placeholder="Search txId / ref / note..."
              className="w-[320px] max-w-full pl-10 pr-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
          >
            <Plus size={18} /> Add Tx
          </button>

          <button
            onClick={resetDemo}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
            title="Reset dummy data"
          >
            <RefreshCw size={18} /> Reset
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">Opening Balance</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            ৳{Number(summary.openingBalance || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">Total Credit (success)</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            ৳{Number(summary.totalCredit || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">Total Debit (success)</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            ৳{Number(summary.totalDebit || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">Current Balance</p>
          <p className="mt-1 text-lg font-bold text-gray-900 inline-flex items-center gap-2">
            <Wallet size={18} className="text-gray-400" />
            ৳{Number(summary.currentBalance || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["credit", "Credit"],
            ["debit", "Debit"],
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

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Transaction</th>
                <th className="text-left px-4 py-3 font-semibold">Type</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Amount</th>
                <th className="text-left px-4 py-3 font-semibold">Source</th>
                <th className="text-left px-4 py-3 font-semibold">Reference</th>
                <th className="text-left px-4 py-3 font-semibold">Updated</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={8}>
                    No wallet transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/60 align-top">
                    {/* Transaction */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{r.txId}</p>
                      <p className="text-xs text-gray-500">DB: {r._id}</p>
                      {r.note ? (
                        <p className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
                          Note: {r.note}
                        </p>
                      ) : null}
                    </td>

                    {/* Type */}
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-2 font-semibold text-gray-900">
                        {txIcon(r.type)} {r.type}
                      </div>
                    </td>

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

                    {/* Amount */}
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      ৳{Number(r.amount || 0).toLocaleString()}
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3 text-gray-700">{r.source || "-"}</td>

                    {/* Reference */}
                    <td className="px-4 py-3 text-gray-700">{r.reference || "-"}</td>

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
      <Modal title="Transaction Details (View)" open={viewOpen} onClose={() => setViewOpen(false)}>
        {!active ? (
          <p className="text-sm text-gray-600">No data</p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl border bg-gray-50">
                <p className="text-xs text-gray-500">Transaction</p>
                <p className="font-semibold text-gray-900">{active.txId}</p>
                <p className="text-xs text-gray-600">DB: {active._id}</p>
              </div>
              <div className="p-4 rounded-2xl border bg-gray-50">
                <p className="text-xs text-gray-500">Type / Status</p>
                <p className="font-semibold text-gray-900">
                  {active.type} • {active.status}
                </p>
                <p className="text-xs text-gray-600">Updated: {fmt(active.updatedAt)}</p>
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
                <p className="text-xs text-gray-500">Source</p>
                <p className="font-semibold text-gray-900">{active.source || "-"}</p>
              </div>

              <div className="p-4 rounded-2xl border">
                <p className="text-xs text-gray-500">Reference</p>
                <p className="font-semibold text-gray-900">{active.reference || "-"}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border">
              <p className="text-xs text-gray-500">Note</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{active.note || "-"}</p>
            </div>

            <div className="p-4 rounded-2xl border bg-gray-50">
              <p className="text-xs text-gray-500">Created / Updated</p>
              <p className="text-sm text-gray-800">
                Created: <span className="font-semibold">{fmt(active.createdAt)}</span>
              </p>
              <p className="text-sm text-gray-800">
                Updated: <span className="font-semibold">{fmt(active.updatedAt)}</span>
              </p>
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
      <Modal title="Add Wallet Transaction" open={createOpen} onClose={() => setCreateOpen(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">TX ID</label>
              <input
                value={form.txId}
                onChange={(e) => setForm((p) => ({ ...p, txId: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as TxType }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="credit">credit</option>
                <option value="debit">debit</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as TxStatus }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="pending">pending</option>
                <option value="success">success</option>
                <option value="failed">failed</option>
                <option value="reversed">reversed</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Balance হিসাবের জন্য only <span className="font-semibold">success</span> ধরা হয়েছে।
              </p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Source</label>
              <select
                value={form.source}
                onChange={(e) =>
                  setForm((p) => ({ ...p, source: e.target.value as any }))
                }
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="commission">commission</option>
                <option value="payout">payout</option>
                <option value="adjustment">adjustment</option>
                <option value="refund">refund</option>
                <option value="other">other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Reference</label>
              <input
                value={form.reference}
                onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))}
                placeholder="ORD-1001 / PO-2026..."
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
              Add
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal title="Edit Wallet Transaction" open={editOpen} onClose={() => setEditOpen(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">TX ID</label>
              <input
                value={form.txId}
                onChange={(e) => setForm((p) => ({ ...p, txId: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as TxType }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="credit">credit</option>
                <option value="debit">debit</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as TxStatus }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="pending">pending</option>
                <option value="success">success</option>
                <option value="failed">failed</option>
                <option value="reversed">reversed</option>
              </select>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Source</label>
              <select
                value={form.source}
                onChange={(e) =>
                  setForm((p) => ({ ...p, source: e.target.value as any }))
                }
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="commission">commission</option>
                <option value="payout">payout</option>
                <option value="adjustment">adjustment</option>
                <option value="refund">refund</option>
                <option value="other">other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Reference</label>
              <input
                value={form.reference}
                onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))}
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
      <Modal title="Delete Transaction" open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{active?.txId}</span>?
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

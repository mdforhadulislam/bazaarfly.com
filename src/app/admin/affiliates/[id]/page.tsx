"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  Copy,
  ExternalLink,
  Globe,
  Link2,
  MousePointerClick,
  TrendingUp,
  Wallet,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type AffiliateStatus = "active" | "suspended";

type PopulatedUser = {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
};

type AffiliateDetails = {
  _id: string;
  user: PopulatedUser;

  affiliateCode: string;
  status: AffiliateStatus;

  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  totalWithdrawn: number;

  websiteUrl?: string;
  notes?: string;

  createdAt: string;
  updatedAt: string;
};

/* ---------------- DUMMY ---------------- */
const DUMMY: AffiliateDetails[] = [
  {
    _id: "65f1a1aa12ab34cd56ef0001",
    user: {
      _id: "u001",
      name: "Rifat Hasan",
      phone: "+8801711000001",
      email: "rifat@gmail.com",
    },
    affiliateCode: "A9C3F1D2",
    status: "active",
    totalClicks: 1240,
    totalConversions: 62,
    totalEarnings: 18500,
    totalWithdrawn: 6000,
    websiteUrl: "https://rifatblog.com",
    notes: "Good performer",
    createdAt: "2026-01-12T10:20:00.000Z",
    updatedAt: "2026-02-01T11:45:00.000Z",
  },
  {
    _id: "65f1a1aa12ab34cd56ef0003",
    user: {
      _id: "u003",
      name: "Siam Ahmed",
      phone: "+8801911000003",
      email: "siam@gmail.com",
    },
    affiliateCode: "F0EE12AB",
    status: "suspended",
    totalClicks: 230,
    totalConversions: 4,
    totalEarnings: 1200,
    totalWithdrawn: 0,
    websiteUrl: "",
    notes: "Suspicious traffic",
    createdAt: "2026-01-22T12:15:00.000Z",
    updatedAt: "2026-02-01T15:05:00.000Z",
  },
];

/* ---------------- HELPERS ---------------- */
const calcConversionRate = (clicks: number, conversions: number) => {
  if (!clicks) return 0;
  return Number(((conversions / clicks) * 100).toFixed(2));
};
const fmt = (d?: string) => (d ? new Date(d).toLocaleString() : "-");
const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : "-");

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
          <div>
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-xs text-gray-500">Use modal to edit / delete</p>
          </div>
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

export default function AffiliateDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [items, setItems] = useState<AffiliateDetails[]>(DUMMY);

  const data = useMemo(() => {
    return items.find((x) => x._id === id) || items[0] || null;
  }, [id, items]);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [form, setForm] = useState({
    status: "active" as AffiliateStatus,
    websiteUrl: "",
    notes: "",
  });

  const conversionRate = useMemo(() => {
    if (!data) return 0;
    return calcConversionRate(data.totalClicks, data.totalConversions);
  }, [data]);

  const currentBalance = useMemo(() => {
    if (!data) return 0;
    return Math.max(0, data.totalEarnings - data.totalWithdrawn);
  }, [data]);

  const referralLink = useMemo(() => {
    if (!data) return "";
    return `https://bazaarfly.com/?ref=${data.affiliateCode}`;
  }, [data]);

  const openEdit = () => {
    if (!data) return;
    setForm({
      status: data.status,
      websiteUrl: data.websiteUrl || "",
      notes: data.notes || "",
    });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!data) return;
    setItems((prev) =>
      prev.map((x) =>
        x._id === data._id
          ? {
              ...x,
              status: form.status,
              websiteUrl: form.websiteUrl,
              notes: form.notes,
              updatedAt: new Date().toISOString(),
            }
          : x
      )
    );
    setEditOpen(false);
  };

  const deleteAffiliate = () => {
    if (!data) return;
    setItems((prev) => prev.filter((x) => x._id !== data._id));
    setDeleteOpen(false);
  };

  const toggleStatusQuick = () => {
    if (!data) return;
    setItems((prev) =>
      prev.map((x) =>
        x._id === data._id
          ? {
              ...x,
              status: x.status === "active" ? "suspended" : "active",
              updatedAt: new Date().toISOString(),
            }
          : x
      )
    );
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  if (!data) {
    return (
      <section className="bg-white border rounded-2xl p-6">
        <p className="text-sm text-gray-600">No affiliate found.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/affiliates"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
          >
            <ArrowLeft size={18} /> Back
          </Link>

          <div>
            <h1 className="text-xl font-bold text-gray-900">Affiliate Details</h1>
            <p className="text-sm text-gray-600">
              {data.user?.name || "Unknown"} • {data.user?.phone || "-"} •{" "}
              {data.user?.email || "-"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Affiliate ID: {data._id} • Code:{" "}
              <span className="font-mono">{data.affiliateCode}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={openEdit}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-orange-50 transition"
          >
            <Pencil size={18} /> Edit
          </button>

          <button
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
          >
            <Trash2 size={18} /> Delete
          </button>

          <button
            onClick={toggleStatusQuick}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
              data.status === "active"
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {data.status === "active" ? (
              <>
                <Ban size={18} /> Suspend
              </>
            ) : (
              <>
                <BadgeCheck size={18} /> Activate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Nav Buttons to sub-pages */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/admin/affiliates/${data._id}/commissions`}
          className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
        >
          Commissions
        </Link>
        <Link
          href={`/admin/affiliates/${data._id}/orders`}
          className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
        >
          Orders
        </Link>
        <Link
          href={`/admin/affiliates/${data._id}/payouts`}
          className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
        >
          Payouts
        </Link>
        <Link
          href={`/admin/affiliates/${data._id}/wallet`}
          className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
        >
          Wallet
        </Link>
        <Link
          href={`/admin/affiliates/${data._id}/link`}
          className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
        >
          Link
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">Clicks</p>
          <p className="mt-1 text-lg font-bold text-gray-900 inline-flex items-center gap-2">
            <MousePointerClick size={18} className="text-gray-400" />
            {data.totalClicks.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">Conversions</p>
          <p className="mt-1 text-lg font-bold text-gray-900 inline-flex items-center gap-2">
            <TrendingUp size={18} className="text-gray-400" />
            {data.totalConversions.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">Conversion Rate</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{conversionRate}%</p>
        </div>
        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">Total Earnings</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            ৳{Number(data.totalEarnings || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white border rounded-2xl p-4">
          <p className="text-xs text-gray-500">Current Balance</p>
          <p className="mt-1 text-lg font-bold text-gray-900 inline-flex items-center gap-2">
            <Wallet size={18} className="text-gray-400" />
            ৳{Number(currentBalance || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border rounded-2xl p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-900">Website</p>
          {data.websiteUrl ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <a
                href={data.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:underline"
              >
                <Globe size={18} />
                {data.websiteUrl}
                <ExternalLink size={16} />
              </a>
              <button
                onClick={() => copy(data.websiteUrl || "")}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50 transition"
              >
                <Copy size={16} /> Copy
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-600">-</p>
          )}

          <div className="pt-2 border-t">
            <p className="text-sm font-semibold text-gray-900 mb-2">Referral Link</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={referralLink}
                readOnly
                className="flex-1 px-4 py-3 rounded-2xl border bg-gray-50 text-sm outline-none"
              />
              <button
                onClick={() => copy(referralLink)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
              >
                <Link2 size={18} /> Copy
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-900">Notes</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.notes || "-"}</p>

          <div className="pt-2 border-t grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border bg-gray-50">
              <p className="text-xs text-gray-500">Created</p>
              <p className="font-semibold text-gray-900">{fmt(data.createdAt)}</p>
            </div>
            <div className="p-4 rounded-2xl border bg-gray-50">
              <p className="text-xs text-gray-500">Updated</p>
              <p className="font-semibold text-gray-900">{fmt(data.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal title="Edit Affiliate" open={editOpen} onClose={() => setEditOpen(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as AffiliateStatus }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="active">active</option>
                <option value="suspended">suspended</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Website URL</label>
              <input
                value={form.websiteUrl}
                onChange={(e) => setForm((p) => ({ ...p, websiteUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={4}
              placeholder="Admin notes..."
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
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal title="Delete Affiliate" open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete <span className="font-semibold">{data.user?.name}</span>?
            <br />
            This action cannot be undone.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              onClick={() => setDeleteOpen(false)}
              className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={deleteAffiliate}
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

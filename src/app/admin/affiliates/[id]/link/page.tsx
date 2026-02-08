"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Link2,
  Copy,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Globe,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type LinkStatus = "active" | "disabled";

type AffiliateLinkRow = {
  _id: string;
  title: string;              // display name
  slug: string;               // short slug for URL
  destinationUrl: string;     // where to redirect (optional)
  notes?: string;
  status: LinkStatus;
  clicks: number;
  conversions: number;
  createdAt: string;
  updatedAt: string;
};

/* ---------------- DUMMY DATA ---------------- */
const DUMMY_LINKS: AffiliateLinkRow[] = [
  {
    _id: "l1",
    title: "Homepage Link",
    slug: "home",
    destinationUrl: "https://bazaarfly.com/",
    notes: "Default referral link for homepage",
    status: "active",
    clicks: 520,
    conversions: 21,
    createdAt: "2026-01-20T10:10:00.000Z",
    updatedAt: "2026-02-02T10:10:00.000Z",
  },
  {
    _id: "l2",
    title: "Fashion Category",
    slug: "fashion",
    destinationUrl: "https://bazaarfly.com/category/fashion",
    notes: "Best converting category",
    status: "active",
    clicks: 310,
    conversions: 14,
    createdAt: "2026-01-25T09:05:00.000Z",
    updatedAt: "2026-02-01T14:20:00.000Z",
  },
  {
    _id: "l3",
    title: "Winter Sale",
    slug: "winter-sale",
    destinationUrl: "https://bazaarfly.com/sale/winter",
    notes: "Paused for now",
    status: "disabled",
    clicks: 88,
    conversions: 2,
    createdAt: "2026-01-28T12:00:00.000Z",
    updatedAt: "2026-01-30T11:15:00.000Z",
  },
];

/* ---------------- HELPERS ---------------- */
const fmt = (d?: string) => (d ? new Date(d).toLocaleString() : "-");

const calcRate = (clicks: number, conversions: number) => {
  if (!clicks) return 0;
  return Number(((conversions / clicks) * 100).toFixed(2));
};

const badge = (status: LinkStatus) =>
  status === "active"
    ? "bg-green-100 text-green-800"
    : "bg-gray-200 text-gray-700";

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
export default function AffiliateLinkPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [rows, setRows] = useState<AffiliateLinkRow[]>(DUMMY_LINKS);
  const [q, setQ] = useState("");

  // modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [active, setActive] = useState<AffiliateLinkRow | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    destinationUrl: "",
    notes: "",
    status: "active" as LinkStatus,
  });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => {
      return (
        r.title.toLowerCase().includes(s) ||
        r.slug.toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s) ||
        (r.destinationUrl || "").toLowerCase().includes(s)
      );
    });
  }, [q, rows]);

  // For UI demo: base referral host
  const baseReferralHost = "https://bazaarfly.com/r";
  const makeRefLink = (slug: string) =>
    `${baseReferralHost}/${encodeURIComponent(id || "affiliate")}/${encodeURIComponent(slug)}`;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  const openCreate = () => {
    setForm({
      title: "",
      slug: "",
      destinationUrl: "https://bazaarfly.com/",
      notes: "",
      status: "active",
    });
    setCreateOpen(true);
  };

  const createRow = () => {
    const slug = form.slug.trim();
    const title = form.title.trim();

    if (!slug || !title) return;

    const newRow: AffiliateLinkRow = {
      _id: `l_${Date.now()}`,
      title,
      slug,
      destinationUrl: form.destinationUrl.trim(),
      notes: form.notes.trim(),
      status: form.status,
      clicks: 0,
      conversions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRows((p) => [newRow, ...p]);
    setCreateOpen(false);
  };

  const openEdit = (r: AffiliateLinkRow) => {
    setActive(r);
    setForm({
      title: r.title,
      slug: r.slug,
      destinationUrl: r.destinationUrl,
      notes: r.notes || "",
      status: r.status,
    });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!active) return;

    const slug = form.slug.trim();
    const title = form.title.trim();
    if (!slug || !title) return;

    setRows((p) =>
      p.map((x) =>
        x._id === active._id
          ? {
              ...x,
              title,
              slug,
              destinationUrl: form.destinationUrl.trim(),
              notes: form.notes.trim(),
              status: form.status,
              updatedAt: new Date().toISOString(),
            }
          : x
      )
    );

    setEditOpen(false);
    setActive(null);
  };

  const openDelete = (r: AffiliateLinkRow) => {
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
            <h1 className="text-xl font-bold text-gray-900">Affiliate Links</h1>
            <p className="text-sm text-gray-600">
              Create / edit / delete tracking links by modal.
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
              placeholder="Search link title / slug / url..."
              className="w-[320px] max-w-full pl-10 pr-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
          >
            <Plus size={18} /> Create Link
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Link</th>
                <th className="text-left px-4 py-3 font-semibold">Ref URL</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Clicks</th>
                <th className="text-right px-4 py-3 font-semibold">Conversions</th>
                <th className="text-right px-4 py-3 font-semibold">Conv. Rate</th>
                <th className="text-left px-4 py-3 font-semibold">Updated</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={8}>
                    No links found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const refUrl = makeRefLink(r.slug);
                  const convRate = calcRate(r.clicks, r.conversions);

                  return (
                    <tr key={r._id} className="hover:bg-gray-50/60 align-top">
                      {/* Link */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{r.title}</p>
                        <p className="text-xs text-gray-500">
                          slug: <span className="font-mono">{r.slug}</span>
                        </p>
                        {r.destinationUrl ? (
                          <a
                            href={r.destinationUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-semibold text-orange-600 hover:underline mt-1"
                          >
                            <Globe size={14} />
                            Destination
                            <ExternalLink size={14} />
                          </a>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">-</p>
                        )}
                        {r.notes ? (
                          <p className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
                            Note: {r.notes}
                          </p>
                        ) : null}
                      </td>

                      {/* Ref URL */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Link2 size={16} className="text-gray-400" />
                            <span className="text-xs font-mono text-gray-900 break-all">
                              {refUrl}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => copy(refUrl)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50 transition"
                            >
                              <Copy size={16} /> Copy
                            </button>

                            <a
                              href={refUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50 transition"
                            >
                              <ExternalLink size={16} /> Open
                            </a>
                          </div>
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

                      {/* Clicks */}
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {r.clicks.toLocaleString()}
                      </td>

                      {/* Conversions */}
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {r.conversions.toLocaleString()}
                      </td>

                      {/* Rate */}
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {convRate}%
                      </td>

                      {/* Updated */}
                      <td className="px-4 py-3 text-gray-700">{fmt(r.updatedAt)}</td>

                      {/* Actions */}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal title="Create Link" open={createOpen} onClose={() => setCreateOpen(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Homepage Link"
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="home"
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL হবে: <span className="font-mono">{makeRefLink(form.slug || "slug")}</span>
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700">Destination URL</label>
            <input
              value={form.destinationUrl}
              onChange={(e) => setForm((p) => ({ ...p, destinationUrl: e.target.value }))}
              placeholder="https://bazaarfly.com/"
              className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as LinkStatus }))}
              className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            >
              <option value="active">active</option>
              <option value="disabled">disabled</option>
            </select>
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
      <Modal title="Edit Link" open={editOpen} onClose={() => setEditOpen(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ref URL: <span className="font-mono">{makeRefLink(form.slug || "slug")}</span>
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700">Destination URL</label>
            <input
              value={form.destinationUrl}
              onChange={(e) => setForm((p) => ({ ...p, destinationUrl: e.target.value }))}
              className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as LinkStatus }))}
              className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            >
              <option value="active">active</option>
              <option value="disabled">disabled</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={4}
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
      <Modal title="Delete Link" open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{active?.title}</span>?
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

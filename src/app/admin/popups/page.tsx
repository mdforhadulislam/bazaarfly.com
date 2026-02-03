"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  LayoutGrid,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  Filter,
  CalendarClock,
  ToggleLeft,
  ToggleRight,
  Copy,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type PopupType = "banner" | "modal" | "toast";
type PopupStatus = "draft" | "scheduled" | "active" | "paused" | "expired";
type TargetAudience = "all" | "customers" | "sellers" | "affiliates";
type PageTarget = "all_pages" | "home" | "product" | "category" | "checkout";

type PopupRow = {
  _id: string;
  name: string;
  type: PopupType;
  status: PopupStatus;

  audience: TargetAudience;
  pageTarget: PageTarget;

  title: string;
  message: string;

  buttonText?: string;
  buttonUrl?: string;

  startAt?: string;
  endAt?: string;

  showOncePerUser: boolean;
  enabled: boolean;

  createdAt: string;
  updatedAt: string;
};

const DUMMY_POPUPS: PopupRow[] = [
  {
    _id: "p1",
    name: "Home Winter Sale",
    type: "modal",
    status: "active",
    audience: "customers",
    pageTarget: "home",
    title: "Winter Sale 🔥",
    message: "Up to 30% off. Limited time offer!",
    buttonText: "Shop Now",
    buttonUrl: "/category/fashion",
    startAt: "2026-02-01T00:00:00.000Z",
    endAt: "2026-02-10T23:59:00.000Z",
    showOncePerUser: true,
    enabled: true,
    createdAt: "2026-01-30T12:00:00.000Z",
    updatedAt: "2026-02-02T09:30:00.000Z",
  },
  {
    _id: "p2",
    name: "Checkout Reminder",
    type: "banner",
    status: "paused",
    audience: "all",
    pageTarget: "checkout",
    title: "Free Delivery",
    message: "Orders above ৳2000 get free delivery (demo).",
    buttonText: "Learn more",
    buttonUrl: "/help/shipping",
    startAt: "2026-02-01T00:00:00.000Z",
    endAt: "2026-02-28T23:59:00.000Z",
    showOncePerUser: false,
    enabled: false,
    createdAt: "2026-02-01T10:10:00.000Z",
    updatedAt: "2026-02-01T10:10:00.000Z",
  },
  {
    _id: "p3",
    name: "New Feature Toast",
    type: "toast",
    status: "scheduled",
    audience: "sellers",
    pageTarget: "all_pages",
    title: "Seller Panel Update",
    message: "New inventory management page is live. Check it now!",
    buttonText: "Open Seller Panel",
    buttonUrl: "/seller",
    startAt: "2026-02-05T08:00:00.000Z",
    endAt: "2026-02-12T23:59:00.000Z",
    showOncePerUser: true,
    enabled: true,
    createdAt: "2026-02-03T05:00:00.000Z",
    updatedAt: "2026-02-03T05:00:00.000Z",
  },
];

const fmt = (d?: string) => (d ? new Date(d).toLocaleString() : "-");

const badge = (s: PopupStatus) => {
  if (s === "active") return "bg-green-100 text-green-800";
  if (s === "scheduled") return "bg-orange-100 text-orange-800";
  if (s === "paused") return "bg-gray-100 text-gray-800";
  if (s === "expired") return "bg-red-100 text-red-800";
  return "bg-slate-100 text-slate-800";
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

export default function AdminPopupsPage() {
  const [rows, setRows] = useState<PopupRow[]>(DUMMY_POPUPS);

  const [q, setQ] = useState("");
  const [type, setType] = useState<PopupType | "all">("all");
  const [status, setStatus] = useState<PopupStatus | "all">("all");
  const [audience, setAudience] = useState<TargetAudience | "all">("all");
  const [pageTarget, setPageTarget] = useState<PageTarget | "all">("all");

  // modals
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);

  const [active, setActive] = useState<PopupRow | null>(null);

  const [form, setForm] = useState({
    name: "",
    type: "modal" as PopupType,
    status: "draft" as PopupStatus,

    audience: "all" as TargetAudience,
    pageTarget: "all_pages" as PageTarget,

    title: "",
    message: "",

    buttonText: "",
    buttonUrl: "",

    startAt: "",
    endAt: "",

    showOncePerUser: true,
    enabled: true,
  });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter((r) => {
      const okType = type === "all" ? true : r.type === type;
      const okStatus = status === "all" ? true : r.status === status;
      const okAud = audience === "all" ? true : r.audience === audience;
      const okPage = pageTarget === "all" ? true : r.pageTarget === pageTarget;

      const okSearch =
        !s ||
        r.name.toLowerCase().includes(s) ||
        r.title.toLowerCase().includes(s) ||
        r.message.toLowerCase().includes(s) ||
        r.type.toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s);

      return okType && okStatus && okAud && okPage && okSearch;
    });
  }, [rows, q, type, status, audience, pageTarget]);

  const openView = (r: PopupRow) => {
    setActive(r);
    setViewOpen(true);
  };

  const openEdit = (r: PopupRow) => {
    setActive(r);
    setForm({
      name: r.name,
      type: r.type,
      status: r.status,
      audience: r.audience,
      pageTarget: r.pageTarget,
      title: r.title,
      message: r.message,
      buttonText: r.buttonText || "",
      buttonUrl: r.buttonUrl || "",
      startAt: r.startAt || "",
      endAt: r.endAt || "",
      showOncePerUser: r.showOncePerUser,
      enabled: r.enabled,
    });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!active) return;
    if (!form.name.trim() || !form.title.trim() || !form.message.trim()) return;

    const now = new Date().toISOString();
    setRows((p) =>
      p.map((x) =>
        x._id === active._id
          ? {
              ...x,
              name: form.name.trim(),
              type: form.type,
              status: form.status,
              audience: form.audience,
              pageTarget: form.pageTarget,
              title: form.title.trim(),
              message: form.message.trim(),
              buttonText: form.buttonText.trim(),
              buttonUrl: form.buttonUrl.trim(),
              startAt: form.startAt || "",
              endAt: form.endAt || "",
              showOncePerUser: form.showOncePerUser,
              enabled: form.enabled,
              updatedAt: now,
            }
          : x
      )
    );

    setEditOpen(false);
    setActive(null);
  };

  const openDelete = (r: PopupRow) => {
    setActive(r);
    setDeleteOpen(true);
  };

  const doDelete = () => {
    if (!active) return;
    setRows((p) => p.filter((x) => x._id !== active._id));
    setDeleteOpen(false);
    setActive(null);
  };

  const toggleEnabled = (r: PopupRow) => {
    const now = new Date().toISOString();
    setRows((p) =>
      p.map((x) =>
        x._id === r._id ? { ...x, enabled: !x.enabled, updatedAt: now } : x
      )
    );
  };

  const openDuplicate = (r: PopupRow) => {
    setActive(r);
    setDuplicateOpen(true);
  };

  const doDuplicate = () => {
    if (!active) return;
    const now = new Date().toISOString();
    const clone: PopupRow = {
      ...active,
      _id: `p_${Date.now()}`,
      name: `${active.name} (Copy)`,
      status: "draft",
      enabled: false,
      createdAt: now,
      updatedAt: now,
    };
    setRows((p) => [clone, ...p]);
    setDuplicateOpen(false);
    setActive(null);
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-orange-50 border">
            <LayoutGrid className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Popups</h1>
            <p className="text-sm text-gray-600">
              Create & manage website popups (modal / banner / toast).
            </p>
          </div>
        </div>

        <Link
          href="/admin/popups/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
        >
          <Plus size={16} /> New Popup
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name / title / message..."
              className="w-[360px] max-w-full pl-9 pr-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border bg-gray-50 text-sm">
            <Filter size={16} className="text-gray-500" />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="bg-transparent outline-none font-semibold"
            >
              <option value="all">All types</option>
              <option value="modal">modal</option>
              <option value="banner">banner</option>
              <option value="toast">toast</option>
            </select>
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="px-3 py-2 rounded-xl border bg-gray-50 text-sm font-semibold outline-none"
          >
            <option value="all">All status</option>
            <option value="draft">draft</option>
            <option value="scheduled">scheduled</option>
            <option value="active">active</option>
            <option value="paused">paused</option>
            <option value="expired">expired</option>
          </select>

          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as any)}
            className="px-3 py-2 rounded-xl border bg-gray-50 text-sm font-semibold outline-none"
          >
            <option value="all">All audience</option>
            <option value="all">all</option>
            <option value="customers">customers</option>
            <option value="sellers">sellers</option>
            <option value="affiliates">affiliates</option>
          </select>

          <select
            value={pageTarget}
            onChange={(e) => setPageTarget(e.target.value as any)}
            className="px-3 py-2 rounded-xl border bg-gray-50 text-sm font-semibold outline-none"
          >
            <option value="all">All pages</option>
            <option value="all_pages">all_pages</option>
            <option value="home">home</option>
            <option value="product">product</option>
            <option value="category">category</option>
            <option value="checkout">checkout</option>
          </select>
        </div>

        <div className="text-xs text-gray-500">
          Tip: Enabled toggle + edit/delete modal (dummy behavior).
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Popup</th>
                <th className="text-left px-4 py-3 font-semibold">Type</th>
                <th className="text-left px-4 py-3 font-semibold">Audience</th>
                <th className="text-left px-4 py-3 font-semibold">Target Page</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Schedule</th>
                <th className="text-left px-4 py-3 font-semibold">Enabled</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={8}>
                    No popups found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/60 align-top">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        <span className="font-semibold">{r.title}</span> — {r.message}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">DB: {r._id}</p>
                    </td>

                    <td className="px-4 py-3 font-semibold text-gray-900">{r.type}</td>

                    <td className="px-4 py-3 font-semibold text-gray-900">{r.audience}</td>

                    <td className="px-4 py-3 font-semibold text-gray-900">{r.pageTarget}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${badge(
                          r.status
                        )}`}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      <div className="inline-flex items-center gap-2 text-xs">
                        <CalendarClock size={16} className="text-gray-400" />
                        <span>
                          {r.startAt ? fmt(r.startAt) : "-"} →{" "}
                          {r.endAt ? fmt(r.endAt) : "-"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleEnabled(r)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50 transition"
                        title="Toggle enabled"
                      >
                        {r.enabled ? (
                          <>
                            <ToggleRight size={18} className="text-green-600" /> Enabled
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={18} className="text-gray-500" /> Disabled
                          </>
                        )}
                      </button>
                    </td>

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
                          onClick={() => openDuplicate(r)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50 transition"
                        >
                          <Copy size={16} /> Duplicate
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
      <Modal title="Popup Details" open={viewOpen} onClose={() => setViewOpen(false)}>
        {!active ? (
          <p className="text-sm text-gray-600">No data</p>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border bg-gray-50">
              <p className="text-xs text-gray-500">Name</p>
              <p className="text-sm font-semibold text-gray-900">{active.name}</p>
              <p className="text-[11px] text-gray-400 mt-1">DB: {active._id}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoCard label="Type" value={active.type} />
              <InfoCard label="Status" value={active.status} />
              <InfoCard label="Audience" value={active.audience} />
              <InfoCard label="Target Page" value={active.pageTarget} />
              <InfoCard label="Show Once/User" value={active.showOncePerUser ? "Yes" : "No"} />
              <InfoCard label="Enabled" value={active.enabled ? "Yes" : "No"} />
            </div>

            <div className="p-4 rounded-2xl border">
              <p className="text-xs text-gray-500">Content</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">{active.title}</p>
              <p className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">{active.message}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoCard label="Start" value={fmt(active.startAt)} />
              <InfoCard label="End" value={fmt(active.endAt)} />
            </div>

            <div className="p-4 rounded-2xl border bg-gray-50">
              <p className="text-xs text-gray-500">Button</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {active.buttonText || "-"}
              </p>
              <p className="text-xs text-gray-600">{active.buttonUrl || "-"}</p>
            </div>

            <div className="text-right">
              <button
                onClick={() => setViewOpen(false)}
                className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal title="Edit Popup" open={editOpen} onClose={() => setEditOpen(false)}>
        <PopupForm form={form} setForm={setForm} />

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-4">
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
      </Modal>

      {/* Duplicate Modal */}
      <Modal title="Duplicate Popup" open={duplicateOpen} onClose={() => setDuplicateOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Duplicate <span className="font-semibold">{active?.name}</span> as a new draft?
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              onClick={() => setDuplicateOpen(false)}
              className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={doDuplicate}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
            >
              Duplicate
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal title="Delete Popup" open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{active?.name}</span>?
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

/* ---------------- SMALL UI PARTS ---------------- */
function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-2xl border">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function PopupForm({
  form,
  setForm,
}: {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-700">Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))}
            className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            placeholder="e.g. Home Sale Popup"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm((p: any) => ({ ...p, type: e.target.value }))}
            className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="modal">modal</option>
            <option value="banner">banner</option>
            <option value="toast">toast</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-700">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm((p: any) => ({ ...p, status: e.target.value }))}
            className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="draft">draft</option>
            <option value="scheduled">scheduled</option>
            <option value="active">active</option>
            <option value="paused">paused</option>
            <option value="expired">expired</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700">Audience</label>
          <select
            value={form.audience}
            onChange={(e) => setForm((p: any) => ({ ...p, audience: e.target.value }))}
            className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="all">all</option>
            <option value="customers">customers</option>
            <option value="sellers">sellers</option>
            <option value="affiliates">affiliates</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-700">Target Page</label>
        <select
          value={form.pageTarget}
          onChange={(e) => setForm((p: any) => ({ ...p, pageTarget: e.target.value }))}
          className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
        >
          <option value="all_pages">all_pages</option>
          <option value="home">home</option>
          <option value="product">product</option>
          <option value="category">category</option>
          <option value="checkout">checkout</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-700">Start At</label>
          <input
            value={form.startAt}
            onChange={(e) => setForm((p: any) => ({ ...p, startAt: e.target.value }))}
            placeholder="2026-02-05T08:00"
            className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700">End At</label>
          <input
            value={form.endAt}
            onChange={(e) => setForm((p: any) => ({ ...p, endAt: e.target.value }))}
            placeholder="2026-02-12T23:59"
            className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-700">Title *</label>
          <input
            value={form.title}
            onChange={(e) => setForm((p: any) => ({ ...p, title: e.target.value }))}
            className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            placeholder="Popup headline"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700">Show once per user</label>
          <select
            value={form.showOncePerUser ? "yes" : "no"}
            onChange={(e) =>
              setForm((p: any) => ({ ...p, showOncePerUser: e.target.value === "yes" }))
            }
            className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-700">Message *</label>
        <textarea
          value={form.message}
          onChange={(e) => setForm((p: any) => ({ ...p, message: e.target.value }))}
          rows={4}
          className="w-full mt-1 px-3 py-2 rounded-2xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
          placeholder="Popup message text..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-700">Button Text</label>
          <input
            value={form.buttonText}
            onChange={(e) =>
              setForm((p: any) => ({ ...p, buttonText: e.target.value }))
            }
            className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            placeholder="e.g. Shop Now"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700">Button URL</label>
          <input
            value={form.buttonUrl}
            onChange={(e) => setForm((p: any) => ({ ...p, buttonUrl: e.target.value }))}
            className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            placeholder="/category/fashion"
          />
        </div>
      </div>

      <div className="p-4 rounded-2xl border bg-gray-50 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Enabled</p>
          <p className="text-xs text-gray-600">Toggle popup visibility (dummy)</p>
        </div>

        <button
          onClick={() => setForm((p: any) => ({ ...p, enabled: !p.enabled }))}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold hover:bg-white transition"
        >
          {form.enabled ? (
            <>
              <ToggleRight size={18} className="text-green-600" /> Enabled
            </>
          ) : (
            <>
              <ToggleLeft size={18} className="text-gray-500" /> Disabled
            </>
          )}
        </button>
      </div>
    </div>
  );
}

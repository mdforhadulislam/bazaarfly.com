"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Send,
  X,
  Users,
  Megaphone,
  CalendarClock,
  CheckCircle,
  Copy,
  Plus,
  Trash2,
  Pencil,
  Eye,
  Search,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type Audience = "all" | "customers" | "sellers" | "affiliates";
type Channel = "in_app" | "email" | "sms";

type BroadcastStatus = "draft" | "scheduled" | "sent";

type BroadcastRow = {
  _id: string;
  title: string;
  message: string;

  audience: Audience;
  channels: Channel[];

  mode: "now" | "schedule";
  scheduleAt?: string;

  status: BroadcastStatus;

  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

/* ---------------- DUMMY DATA ---------------- */
const DUMMY_HISTORY: BroadcastRow[] = [
  {
    _id: "b1",
    title: "Winter Sale 🔥",
    message: "Up to 30% off on selected products. Limited time!",
    audience: "customers",
    channels: ["in_app"],
    mode: "now",
    status: "sent",
    createdBy: "Admin",
    createdAt: "2026-01-29T12:00:00.000Z",
    updatedAt: "2026-01-29T12:05:00.000Z",
  },
  {
    _id: "b2",
    title: "Seller policy update",
    message: "Please update your store details in your seller panel.",
    audience: "sellers",
    channels: ["in_app", "email"],
    mode: "schedule",
    status: "scheduled",
    scheduleAt: "2026-02-05T10:00:00.000Z",
    createdBy: "Admin",
    createdAt: "2026-02-02T10:10:00.000Z",
    updatedAt: "2026-02-02T10:10:00.000Z",
  },
  {
    _id: "b3",
    title: "Affiliate payout notice",
    message: "Affiliate payouts will be processed within 24 hours (demo).",
    audience: "affiliates",
    channels: ["in_app"],
    mode: "now",
    status: "draft",
    createdBy: "Admin",
    createdAt: "2026-02-03T08:20:00.000Z",
    updatedAt: "2026-02-03T08:20:00.000Z",
  },
];

const TEMPLATES = [
  {
    title: "Flash Sale",
    message: "⚡ Flash Sale! Limited time offer. Shop now and save big!",
  },
  {
    title: "Order Update",
    message:
      "Your order status has been updated. Please check your dashboard for details.",
  },
  {
    title: "New Feature",
    message:
      "✨ New feature available! Update your app/visit website to enjoy the latest improvements.",
  },
  {
    title: "Maintenance",
    message:
      "🔧 Scheduled maintenance tonight 11PM - 12AM. Service might be temporarily unavailable.",
  },
];

/* ---------------- HELPERS ---------------- */
const fmt = (d?: string) => (d ? new Date(d).toLocaleString() : "-");

const badge = (s: BroadcastStatus) => {
  if (s === "sent") return "bg-green-100 text-green-800";
  if (s === "scheduled") return "bg-orange-100 text-orange-800";
  return "bg-gray-100 text-gray-800";
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

function ChannelChip({ c }: { c: Channel }) {
  return (
    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
      {c}
    </span>
  );
}

/* ---------------- PAGE ---------------- */
export default function BroadcastPage() {
  const [rows, setRows] = useState<BroadcastRow[]>(DUMMY_HISTORY);

  // list filters
  const [q, setQ] = useState("");
  const [audFilter, setAudFilter] = useState<Audience | "all">("all");
  const [statusFilter, setStatusFilter] = useState<BroadcastStatus | "all">(
    "all"
  );

  // composer state (modal)
  const [composerOpen, setComposerOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [mode, setMode] = useState<"now" | "schedule">("now");
  const [scheduleAt, setScheduleAt] = useState("");

  const [form, setForm] = useState({
    title: "",
    message: "",
    audience: "all" as Audience,
    channels: ["in_app"] as Channel[],
    status: "draft" as BroadcastStatus,
  });

  const [active, setActive] = useState<BroadcastRow | null>(null);

  const canSave = useMemo(
    () => Boolean(form.title.trim()) && Boolean(form.message.trim()),
    [form.title, form.message]
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    return rows.filter((r) => {
      const okAud = audFilter === "all" ? true : r.audience === audFilter;
      const okStatus =
        statusFilter === "all" ? true : r.status === statusFilter;

      const okSearch =
        !s ||
        r.title.toLowerCase().includes(s) ||
        r.message.toLowerCase().includes(s) ||
        r.audience.toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s) ||
        r.channels.join(",").toLowerCase().includes(s);

      return okAud && okStatus && okSearch;
    });
  }, [rows, q, audFilter, statusFilter]);

  const openCreate = () => {
    setActive(null);
    setForm({
      title: "",
      message: "",
      audience: "all",
      channels: ["in_app"],
      status: "draft",
    });
    setMode("now");
    setScheduleAt("");
    setComposerOpen(true);
  };

  const openEdit = (r: BroadcastRow) => {
    setActive(r);
    setForm({
      title: r.title,
      message: r.message,
      audience: r.audience,
      channels: r.channels,
      status: r.status,
    });
    setMode(r.mode);
    setScheduleAt(r.scheduleAt || "");
    setComposerOpen(true);
  };

  const openView = (r: BroadcastRow) => {
    setActive(r);
    setViewOpen(true);
  };

  const openDelete = (r: BroadcastRow) => {
    setActive(r);
    setDeleteOpen(true);
  };

  const toggleChannel = (c: Channel) => {
    setForm((p) => ({
      ...p,
      channels: p.channels.includes(c)
        ? p.channels.filter((x) => x !== c)
        : [...p.channels, c],
    }));
  };

  const applyTemplate = (t: { title: string; message: string }) => {
    setForm((p) => ({ ...p, title: t.title, message: t.message }));
    setTemplateOpen(false);
  };

  const saveDraftOrScheduleOrSend = () => {
    if (!canSave) return;

    const now = new Date().toISOString();

    const computedStatus: BroadcastStatus =
      form.status === "sent"
        ? "sent"
        : mode === "schedule"
        ? "scheduled"
        : form.status; // draft or sent

    const payload: BroadcastRow = {
      _id: active?._id || `b_${Date.now()}`,
      title: form.title.trim(),
      message: form.message.trim(),
      audience: form.audience,
      channels: form.channels,
      mode,
      scheduleAt: mode === "schedule" ? scheduleAt || "" : "",
      status: computedStatus,
      createdBy: active?.createdBy || "Admin",
      createdAt: active?.createdAt || now,
      updatedAt: now,
    };

    if (active) {
      setRows((p) => p.map((x) => (x._id === active._id ? payload : x)));
    } else {
      setRows((p) => [payload, ...p]);
    }

    setComposerOpen(false);
    setActive(null);
  };

  const deleteItem = () => {
    if (!active) return;
    setRows((p) => p.filter((x) => x._id !== active._id));
    setDeleteOpen(false);
    setActive(null);
  };

  const quickSend = (r: BroadcastRow) => {
    // demo: instantly mark as sent
    const now = new Date().toISOString();
    setRows((p) =>
      p.map((x) =>
        x._id === r._id ? { ...x, status: "sent", updatedAt: now } : x
      )
    );
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/notifications"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
          >
            <ArrowLeft size={18} /> Back
          </Link>

          <div>
            <h1 className="text-xl font-bold text-gray-900">Broadcast</h1>
            <p className="text-sm text-gray-600">
              Create / edit / delete broadcasts with modal (dummy UI).
            </p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
        >
          <Plus size={16} /> New Broadcast
        </button>
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
              placeholder="Search title / message / channel..."
              className="w-[360px] max-w-full pl-9 pr-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <select
            value={audFilter}
            onChange={(e) => setAudFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border bg-gray-50 text-sm font-semibold outline-none"
          >
            <option value="all">All audience</option>
            <option value="customers">customers</option>
            <option value="sellers">sellers</option>
            <option value="affiliates">affiliates</option>
            <option value="all">all</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border bg-gray-50 text-sm font-semibold outline-none"
          >
            <option value="all">All status</option>
            <option value="draft">draft</option>
            <option value="scheduled">scheduled</option>
            <option value="sent">sent</option>
          </select>
        </div>

        <div className="text-xs text-gray-500">
          Tip: Draft/Scheduled item “Send now” করলে status sent হবে (demo).
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Broadcast</th>
                <th className="text-left px-4 py-3 font-semibold">Audience</th>
                <th className="text-left px-4 py-3 font-semibold">Channels</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Schedule</th>
                <th className="text-left px-4 py-3 font-semibold">Updated</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={7}>
                    No broadcasts found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/60 align-top">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{r.title}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {r.message}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">DB: {r._id}</p>
                    </td>

                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {r.audience}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {r.channels.map((c) => (
                          <ChannelChip key={c} c={c} />
                        ))}
                      </div>
                    </td>

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
                      {r.mode === "schedule" ? fmt(r.scheduleAt) : "Now"}
                    </td>

                    <td className="px-4 py-3 text-gray-700">{fmt(r.updatedAt)}</td>

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

                        {r.status !== "sent" ? (
                          <button
                            onClick={() => quickSend(r)}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition"
                          >
                            <Send size={16} /> Send now
                          </button>
                        ) : null}

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

      {/* Composer Modal (Create/Edit) */}
      <Modal
        title={active ? "Edit Broadcast" : "Create Broadcast"}
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="text-xs text-gray-500">
              You can save as <span className="font-semibold">draft</span> or{" "}
              <span className="font-semibold">scheduled</span> or{" "}
              <span className="font-semibold">sent</span> (demo).
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setTemplateOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50 transition"
              >
                <Copy size={16} /> Templates
              </button>
              <button
                onClick={() => setPreviewOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50 transition"
              >
                <Megaphone size={16} /> Preview
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700">Title *</label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="e.g. Flash Sale Today!"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700">Audience</label>
              <select
                value={form.audience}
                onChange={(e) =>
                  setForm((p) => ({ ...p, audience: e.target.value as Audience }))
                }
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
            <label className="text-xs font-semibold text-gray-700">Message *</label>
            <textarea
              value={form.message}
              onChange={(e) =>
                setForm((p) => ({ ...p, message: e.target.value }))
              }
              rows={5}
              className="w-full mt-1 px-3 py-2 rounded-2xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              placeholder="Write broadcast message..."
            />
            <div className="mt-2 text-xs text-gray-500">
              Characters: <span className="font-semibold">{form.message.length}</span>
            </div>
          </div>

          {/* Channels */}
          <div className="p-4 rounded-2xl border bg-gray-50">
            <p className="text-sm font-semibold text-gray-900">Channels</p>
            <p className="text-xs text-gray-600 mt-1">
              Choose where to send this broadcast.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {(["in_app", "email", "sms"] as Channel[]).map((c) => (
                <button
                  key={c}
                  onClick={() => toggleChannel(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                    form.channels.includes(c)
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Mode + schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl border">
              <p className="text-sm font-semibold text-gray-900">Mode</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setMode("now")}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                    mode === "now"
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  Now
                </button>
                <button
                  onClick={() => setMode("schedule")}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                    mode === "schedule"
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  Schedule
                </button>
              </div>

              {mode === "schedule" ? (
                <div className="mt-3">
                  <label className="text-xs font-semibold text-gray-700">
                    Schedule At
                  </label>
                  <input
                    value={scheduleAt}
                    onChange={(e) => setScheduleAt(e.target.value)}
                    placeholder="2026-02-05T10:00"
                    className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
                  />
                  <div className="mt-2 text-xs text-gray-500 inline-flex items-center gap-2">
                    <CalendarClock size={16} className="text-gray-400" />
                    ISO datetime (dummy input)
                  </div>
                </div>
              ) : null}
            </div>

            <div className="p-4 rounded-2xl border lg:col-span-2">
              <p className="text-sm font-semibold text-gray-900">Status</p>
              <p className="text-xs text-gray-600 mt-1">
                Draft / Scheduled / Sent (demo)
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {(["draft", "scheduled", "sent"] as BroadcastStatus[]).map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => setForm((p) => ({ ...p, status: s }))}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                        form.status === s
                          ? "bg-orange-600 text-white border-orange-600"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {s}
                    </button>
                  )
                )}
              </div>

              <div className="mt-3 text-xs text-gray-500 inline-flex items-center gap-2">
                <Users size={16} className="text-gray-400" />
                Audience: <span className="font-semibold">{form.audience}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-1">
            <button
              onClick={() => setComposerOpen(false)}
              className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            <button
              onClick={saveDraftOrScheduleOrSend}
              disabled={!canSave}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                canSave
                  ? "bg-orange-600 text-white hover:bg-orange-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              <CheckCircle size={16} /> {active ? "Save changes" : "Save"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Templates Modal */}
      <Modal title="Templates" open={templateOpen} onClose={() => setTemplateOpen(false)}>
        <div className="space-y-3">
          {TEMPLATES.map((t) => (
            <div key={t.title} className="p-4 rounded-2xl border">
              <p className="text-sm font-semibold text-gray-900">{t.title}</p>
              <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">
                {t.message}
              </p>
              <div className="mt-3 text-right">
                <button
                  onClick={() => applyTemplate(t)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
                >
                  <Plus size={16} /> Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal title="Preview" open={previewOpen} onClose={() => setPreviewOpen(false)}>
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border bg-gray-50">
            <p className="text-xs text-gray-500">Audience</p>
            <p className="text-sm font-semibold text-gray-900 inline-flex items-center gap-2">
              <Users size={16} className="text-gray-400" /> {form.audience}
            </p>
          </div>

          <div className="p-4 rounded-2xl border">
            <p className="text-xs text-gray-500">Title</p>
            <p className="text-sm font-semibold text-gray-900">{form.title || "—"}</p>

            <p className="text-xs text-gray-500 mt-4">Message</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {form.message || "—"}
            </p>
          </div>

          <div className="p-4 rounded-2xl border bg-gray-50">
            <p className="text-xs text-gray-500">Channels</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {form.channels.map((c) => (
                <ChannelChip key={c} c={c} />
              ))}
            </div>

            <div className="mt-3 text-xs text-gray-600">
              Mode:{" "}
              <span className="font-semibold">
                {mode === "now" ? "Now" : `Schedule (${scheduleAt || "not set"})`}
              </span>
            </div>
          </div>

          <div className="text-right">
            <button
              onClick={() => setPreviewOpen(false)}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal title="Broadcast Details" open={viewOpen} onClose={() => setViewOpen(false)}>
        {!active ? (
          <p className="text-sm text-gray-600">No data</p>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl border bg-gray-50">
              <p className="text-xs text-gray-500">Title</p>
              <p className="text-sm font-semibold text-gray-900">{active.title}</p>
              <p className="text-[11px] text-gray-400 mt-1">DB: {active._id}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl border">
                <p className="text-xs text-gray-500">Audience</p>
                <p className="font-semibold text-gray-900">{active.audience}</p>
              </div>

              <div className="p-4 rounded-2xl border">
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-semibold text-gray-900">{active.status}</p>
              </div>

              <div className="p-4 rounded-2xl border">
                <p className="text-xs text-gray-500">Mode</p>
                <p className="font-semibold text-gray-900">{active.mode}</p>
              </div>

              <div className="p-4 rounded-2xl border">
                <p className="text-xs text-gray-500">Schedule</p>
                <p className="font-semibold text-gray-900">
                  {active.mode === "schedule" ? fmt(active.scheduleAt) : "Now"}
                </p>
              </div>

              <div className="p-4 rounded-2xl border">
                <p className="text-xs text-gray-500">Created</p>
                <p className="font-semibold text-gray-900">{fmt(active.createdAt)}</p>
              </div>

              <div className="p-4 rounded-2xl border">
                <p className="text-xs text-gray-500">Updated</p>
                <p className="font-semibold text-gray-900">{fmt(active.updatedAt)}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border">
              <p className="text-xs text-gray-500">Message</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {active.message}
              </p>
            </div>

            <div className="p-4 rounded-2xl border bg-gray-50">
              <p className="text-xs text-gray-500">Channels</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {active.channels.map((c) => (
                  <ChannelChip key={c} c={c} />
                ))}
              </div>
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

      {/* Delete Modal */}
      <Modal title="Delete Broadcast" open={deleteOpen} onClose={() => setDeleteOpen(false)}>
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
              onClick={deleteItem}
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

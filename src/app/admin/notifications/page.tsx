"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  Circle,
  Send,
  Filter,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type NotificationType = "system" | "order" | "payment" | "affiliate" | "marketing";
type NotificationStatus = "unread" | "read";

type NotificationRow = {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;

  receiverRole: "admin" | "customer" | "seller" | "affiliate" | "all";
  receiverId?: string;

  actionUrl?: string;

  createdAt: string;
  updatedAt: string;
};

/* ---------------- DUMMY DATA ---------------- */
const DUMMY_NOTIFICATIONS: NotificationRow[] = [
  {
    _id: "n1",
    title: "New order received",
    message: "Order ORD-1022 has been placed successfully.",
    type: "order",
    status: "unread",
    receiverRole: "admin",
    actionUrl: "/admin/orders/ORD-1022",
    createdAt: "2026-02-02T20:40:00.000Z",
    updatedAt: "2026-02-02T20:40:00.000Z",
  },
  {
    _id: "n2",
    title: "Payment success",
    message: "Payment verified for Order ORD-1015. Amount ৳1,490.",
    type: "payment",
    status: "read",
    receiverRole: "admin",
    actionUrl: "/admin/payments",
    createdAt: "2026-02-02T09:10:00.000Z",
    updatedAt: "2026-02-02T10:05:00.000Z",
  },
  {
    _id: "n3",
    title: "Affiliate application pending",
    message: "New affiliate application awaiting review.",
    type: "affiliate",
    status: "unread",
    receiverRole: "admin",
    actionUrl: "/admin/affiliates/applications",
    createdAt: "2026-02-01T14:20:00.000Z",
    updatedAt: "2026-02-01T14:20:00.000Z",
  },
  {
    _id: "n4",
    title: "System maintenance",
    message: "Tonight 11PM - 12AM scheduled maintenance (dummy).",
    type: "system",
    status: "read",
    receiverRole: "all",
    actionUrl: "",
    createdAt: "2026-01-31T18:30:00.000Z",
    updatedAt: "2026-01-31T18:30:00.000Z",
  },
];

/* ---------------- HELPERS ---------------- */
const fmt = (d?: string) => (d ? new Date(d).toLocaleString() : "-");

const typeBadge = (t: NotificationType) => {
  if (t === "order") return "bg-blue-100 text-blue-800";
  if (t === "payment") return "bg-green-100 text-green-800";
  if (t === "affiliate") return "bg-purple-100 text-purple-800";
  if (t === "marketing") return "bg-orange-100 text-orange-800";
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
export default function AdminNotificationsPage() {
  const [rows, setRows] = useState<NotificationRow[]>(DUMMY_NOTIFICATIONS);

  const [q, setQ] = useState("");
  const [type, setType] = useState<NotificationType | "all">("all");
  const [status, setStatus] = useState<NotificationStatus | "all">("all");
  const [role, setRole] = useState<NotificationRow["receiverRole"] | "all">("all");

  // modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [active, setActive] = useState<NotificationRow | null>(null);

  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "system" as NotificationType,
    status: "unread" as NotificationStatus,
    receiverRole: "admin" as NotificationRow["receiverRole"],
    receiverId: "",
    actionUrl: "",
  });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    return rows.filter((r) => {
      const okType = type === "all" ? true : r.type === type;
      const okStatus = status === "all" ? true : r.status === status;
      const okRole = role === "all" ? true : r.receiverRole === role;

      const okSearch =
        !s ||
        r.title.toLowerCase().includes(s) ||
        r.message.toLowerCase().includes(s) ||
        r.type.toLowerCase().includes(s) ||
        r.receiverRole.toLowerCase().includes(s) ||
        (r.receiverId || "").toLowerCase().includes(s);

      return okType && okStatus && okRole && okSearch;
    });
  }, [rows, q, type, status, role]);

  const counts = useMemo(() => {
    const unread = rows.filter((x) => x.status === "unread").length;
    const read = rows.filter((x) => x.status === "read").length;
    return { unread, read, total: rows.length };
  }, [rows]);

  const openCreate = () => {
    setForm({
      title: "",
      message: "",
      type: "system",
      status: "unread",
      receiverRole: "admin",
      receiverId: "",
      actionUrl: "",
    });
    setCreateOpen(true);
  };

  const createRow = () => {
    if (!form.title.trim() || !form.message.trim()) return;

    const now = new Date().toISOString();

    const newRow: NotificationRow = {
      _id: `n_${Date.now()}`,
      title: form.title.trim(),
      message: form.message.trim(),
      type: form.type,
      status: form.status,
      receiverRole: form.receiverRole,
      receiverId: form.receiverId.trim() || "",
      actionUrl: form.actionUrl.trim() || "",
      createdAt: now,
      updatedAt: now,
    };

    setRows((p) => [newRow, ...p]);
    setCreateOpen(false);
  };

  const openView = (r: NotificationRow) => {
    setActive(r);
    setViewOpen(true);

    // auto mark as read (demo)
    setRows((p) =>
      p.map((x) =>
        x._id === r._id ? { ...x, status: "read", updatedAt: new Date().toISOString() } : x
      )
    );
  };

  const openEdit = (r: NotificationRow) => {
    setActive(r);
    setForm({
      title: r.title,
      message: r.message,
      type: r.type,
      status: r.status,
      receiverRole: r.receiverRole,
      receiverId: r.receiverId || "",
      actionUrl: r.actionUrl || "",
    });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!active) return;
    if (!form.title.trim() || !form.message.trim()) return;

    setRows((p) =>
      p.map((x) =>
        x._id === active._id
          ? {
              ...x,
              title: form.title.trim(),
              message: form.message.trim(),
              type: form.type,
              status: form.status,
              receiverRole: form.receiverRole,
              receiverId: form.receiverId.trim() || "",
              actionUrl: form.actionUrl.trim() || "",
              updatedAt: new Date().toISOString(),
            }
          : x
      )
    );

    setEditOpen(false);
    setActive(null);
  };

  const openDelete = (r: NotificationRow) => {
    setActive(r);
    setDeleteOpen(true);
  };

  const doDelete = () => {
    if (!active) return;
    setRows((p) => p.filter((x) => x._id !== active._id));
    setDeleteOpen(false);
    setActive(null);
  };

  const toggleRead = (r: NotificationRow) => {
    setRows((p) =>
      p.map((x) =>
        x._id === r._id
          ? {
              ...x,
              status: x.status === "read" ? "unread" : "read",
              updatedAt: new Date().toISOString(),
            }
          : x
      )
    );
  };

  const markAllRead = () => {
    const now = new Date().toISOString();
    setRows((p) => p.map((x) => ({ ...x, status: "read", updatedAt: now })));
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-orange-50 border">
            <Bell className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-600">
              Manage admin notifications (create / edit / delete with modal).
            </p>
            <p className="text-xs text-gray-500">
              Total: {counts.total} • Unread: {counts.unread} • Read: {counts.read}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Link
            href="/admin/notifications/broadcast"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
          >
            <Send size={16} /> Broadcast
          </Link>

          <button
            onClick={markAllRead}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
          >
            <CheckCircle size={16} /> Mark all read
          </button>

          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
          >
            <Plus size={16} /> Create
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title / message / role..."
              className="w-[340px] max-w-full pl-9 pr-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm bg-gray-50">
            <Filter size={16} className="text-gray-500" />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="bg-transparent outline-none font-semibold"
            >
              <option value="all">All types</option>
              <option value="system">system</option>
              <option value="order">order</option>
              <option value="payment">payment</option>
              <option value="affiliate">affiliate</option>
              <option value="marketing">marketing</option>
            </select>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm bg-gray-50">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="bg-transparent outline-none font-semibold"
            >
              <option value="all">All status</option>
              <option value="unread">unread</option>
              <option value="read">read</option>
            </select>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm bg-gray-50">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="bg-transparent outline-none font-semibold"
            >
              <option value="all">All roles</option>
              <option value="admin">admin</option>
              <option value="customer">customer</option>
              <option value="seller">seller</option>
              <option value="affiliate">affiliate</option>
              <option value="all">all</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Tip: View করলে auto read হবে (demo behavior).
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Notification</th>
                <th className="text-left px-4 py-3 font-semibold">Type</th>
                <th className="text-left px-4 py-3 font-semibold">Receiver</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Created</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={6}>
                    No notifications found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50/60 align-top">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() => toggleRead(r)}
                          className="mt-1 p-1 rounded-lg hover:bg-gray-100"
                          title="Toggle read/unread"
                        >
                          {r.status === "read" ? (
                            <CheckCircle size={18} className="text-green-600" />
                          ) : (
                            <Circle size={18} className="text-orange-600" />
                          )}
                        </button>

                        <div>
                          <p className="font-semibold text-gray-900">{r.title}</p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {r.message}
                          </p>
                          {r.actionUrl ? (
                            <p className="text-xs text-gray-500 mt-2">
                              Action: <span className="font-semibold">{r.actionUrl}</span>
                            </p>
                          ) : null}
                          <p className="text-[11px] text-gray-400 mt-1">DB: {r._id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${typeBadge(
                          r.type
                        )}`}
                      >
                        {r.type}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{r.receiverRole}</p>
                      <p className="text-xs text-gray-600">{r.receiverId || "-"}</p>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          r.status === "read"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-700">{fmt(r.createdAt)}</td>

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
      <Modal title="Notification Details" open={viewOpen} onClose={() => setViewOpen(false)}>
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
                <p className="text-xs text-gray-500">Type</p>
                <p className="font-semibold text-gray-900">{active.type}</p>
              </div>

              <div className="p-4 rounded-2xl border">
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-semibold text-gray-900">{active.status}</p>
              </div>

              <div className="p-4 rounded-2xl border">
                <p className="text-xs text-gray-500">Receiver</p>
                <p className="font-semibold text-gray-900">{active.receiverRole}</p>
                <p className="text-xs text-gray-600">{active.receiverId || "-"}</p>
              </div>

              <div className="p-4 rounded-2xl border">
                <p className="text-xs text-gray-500">Created</p>
                <p className="font-semibold text-gray-900">{fmt(active.createdAt)}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl border">
              <p className="text-xs text-gray-500">Message</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{active.message}</p>
            </div>

            <div className="p-4 rounded-2xl border bg-gray-50">
              <p className="text-xs text-gray-500">Action URL</p>
              <p className="text-sm font-semibold text-gray-900">{active.actionUrl || "-"}</p>
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

      {/* Create Modal */}
      <Modal title="Create Notification" open={createOpen} onClose={() => setCreateOpen(false)}>
        <FormFields form={form} setForm={setForm} />

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-4">
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
      </Modal>

      {/* Edit Modal */}
      <Modal title="Edit Notification" open={editOpen} onClose={() => setEditOpen(false)}>
        <FormFields form={form} setForm={setForm} />

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

      {/* Delete Modal */}
      <Modal title="Delete Notification" open={deleteOpen} onClose={() => setDeleteOpen(false)}>
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

/* ---------------- FORM FIELDS COMPONENT ---------------- */
function FormFields({
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
          <label className="text-xs font-semibold text-gray-700">Title *</label>
          <input
            value={form.title}
            onChange={(e) => setForm((p: any) => ({ ...p, title: e.target.value }))}
            className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            placeholder="e.g. New Order Received"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm((p: any) => ({ ...p, type: e.target.value }))}
            className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="system">system</option>
            <option value="order">order</option>
            <option value="payment">payment</option>
            <option value="affiliate">affiliate</option>
            <option value="marketing">marketing</option>
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
          placeholder="Write notification message..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-700">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm((p: any) => ({ ...p, status: e.target.value }))}
            className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="unread">unread</option>
            <option value="read">read</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700">Receiver Role</label>
          <select
            value={form.receiverRole}
            onChange={(e) => setForm((p: any) => ({ ...p, receiverRole: e.target.value }))}
            className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
          >
            <option value="admin">admin</option>
            <option value="customer">customer</option>
            <option value="seller">seller</option>
            <option value="affiliate">affiliate</option>
            <option value="all">all</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-700">Receiver ID (optional)</label>
          <input
            value={form.receiverId}
            onChange={(e) => setForm((p: any) => ({ ...p, receiverId: e.target.value }))}
            className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            placeholder="UserId / SellerId / AffiliateId"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-700">Action URL (optional)</label>
          <input
            value={form.actionUrl}
            onChange={(e) => setForm((p: any) => ({ ...p, actionUrl: e.target.value }))}
            className="w-full mt-1 px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            placeholder="/admin/orders/ORD-1022"
          />
        </div>
      </div>
    </div>
  );
}

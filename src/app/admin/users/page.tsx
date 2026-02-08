"use client";

import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Search,
  Shield,
  Trash2,
  UserCog,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type Role = "user" | "affiliate" | "admin";

type UserRow = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: Role;
  isDeleted?: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

/* =========================
   BADGES
========================= */
function RoleBadge({ role }: { role: Role }) {
  const map: Record<Role, string> = {
    user: "bg-gray-100 text-gray-700",
    affiliate: "bg-orange-100 text-orange-700",
    admin: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[role]}`}>
      {role}
    </span>
  );
}

function StatusBadge({
  isDeleted,
  isEmailVerified,
}: {
  isDeleted?: boolean;
  isEmailVerified?: boolean;
}) {
  if (isDeleted) {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        Deleted
      </span>
    );
  }
  if (isEmailVerified) {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        Verified
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
      Unverified
    </span>
  );
}

/* =========================
   REUSABLE MODAL WRAPPER
========================= */
function ModalShell({
  open,
  onClose,
  title,
  icon,
  children,
  footer,
  maxWidth = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={`w-full ${maxWidth} bg-white rounded-2xl shadow-xl border overflow-hidden`}>
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="font-semibold text-gray-800">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-500"
              type="button"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4">{children}</div>

          {footer ? <div className="p-4 border-t bg-white">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

/* =========================
   FETCH HELPERS (same file)
========================= */
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
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

export default function AdminUsersPage() {
  // UI state
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"" | Role>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // API data state
  const [rows, setRows] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Loading states
  const [tableLoading, setTableLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [selected, setSelected] = useState<UserRow | null>(null);
  const [confirmMode, setConfirmMode] = useState<"delete" | "restore">("delete");

  // Edit form state
  const [editRole, setEditRole] = useState<Role>("user");
  const [editVerified, setEditVerified] = useState(false);
  const [editDeleted, setEditDeleted] = useState(false);

  /* =========================
     API CALLS
  ========================== */
  const fetchUsers = async (opts?: { resetPage?: boolean }) => {
    try {
      if (opts?.resetPage) setPage(1);

      setTableLoading(true);

      const q = buildQuery({
        page: opts?.resetPage ? 1 : page,
        limit,
        search,
        role,
        includeDeleted: true, // so restore works
      });

      const res = await fetch(`/api/account${q}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const json = await safeJson(res);

      if (!res.ok) {
        throw new Error(json?.message || json?.msg || "Failed to fetch users");
      }

      const users: UserRow[] = json?.data?.users ?? [];
      const pg: Pagination =
        json?.data?.pagination ?? {
          total: users.length,
          page: 1,
          limit,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        };

      setRows(users);
      setPagination(pg);
    } catch (e: any) {
      alert(e?.message || "Failed to fetch users");
    } finally {
      setTableLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: Partial<UserRow>) => {
    const res = await fetch(`/api/account`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, updates }),
    });

    const json = await safeJson(res);
    if (!res.ok) throw new Error(json?.message || json?.msg || "Failed to update user");
    return json;
  };

  const softDeleteUser = async (userId: string) => {
    const res = await fetch(`/api/account${buildQuery({ userId })}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    const json = await safeJson(res);
    if (!res.ok) throw new Error(json?.message || json?.msg || "Failed to delete user");
    return json;
  };

  const restoreUser = async (userId: string) => {
    const res = await fetch(`/api/account`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const json = await safeJson(res);
    if (!res.ok) throw new Error(json?.message || json?.msg || "Failed to restore user");
    return json;
  };

  /* =========================
     LOAD USERS
  ========================== */
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, role]);

  // Search debounce (server-side)
  useEffect(() => {
    const t = setTimeout(() => {
      fetchUsers({ resetPage: true });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const total = pagination.total;
  const totalPages = Math.max(1, pagination.totalPages);
  const pageSafe = Math.min(page, totalPages);

  /* =========================
     OPEN MODALS
  ========================== */
  const openView = (u: UserRow) => {
    setSelected(u);
    setViewOpen(true);
  };

  const openEdit = (u: UserRow) => {
    setSelected(u);
    setEditRole(u.role);
    setEditVerified(!!u.isEmailVerified);
    setEditDeleted(!!u.isDeleted);
    setEditOpen(true);
  };

  const openConfirmDelete = (u: UserRow) => {
    setSelected(u);
    setConfirmMode("delete");
    setConfirmOpen(true);
  };

  const openConfirmRestore = (u: UserRow) => {
    setSelected(u);
    setConfirmMode("restore");
    setConfirmOpen(true);
  };

  /* =========================
     CLOSE MODALS
  ========================== */
  const closeView = () => {
    setViewOpen(false);
    setSelected(null);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setSelected(null);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setSelected(null);
  };

  /* =========================
     ACTIONS (REAL)
  ========================== */
  const handleSaveEdit = async () => {
    if (!selected) return;

    try {
      setLoading(true);

      await updateUser(selected._id, {
        role: editRole,
        isEmailVerified: editVerified,
        isDeleted: editDeleted,
      });

      alert("User updated successfully");
      closeEdit();
      await fetchUsers();
    } catch (e: any) {
      alert(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!selected) return;

    try {
      setLoading(true);

      if (confirmMode === "delete") {
        await softDeleteUser(selected._id);
        alert("Soft deleted successfully");
      } else {
        await restoreUser(selected._id);
        alert("Restored successfully");
      }

      closeConfirm();
      await fetchUsers();
    } catch (e: any) {
      alert(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Users</h1>
          <p className="text-sm text-gray-500">Manage all registered users</p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-md text-sm font-semibold border hover:bg-gray-50 transition">
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-6">
            <label className="text-xs font-semibold text-gray-600">Search</label>
            <div className="mt-1 flex items-center gap-2 border rounded-md px-3 py-2 bg-white">
              <Search size={18} className="text-gray-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  // page reset handled in debounce effect
                }}
                placeholder="Search by name, email, phone..."
                className="w-full outline-none text-sm"
              />
            </div>
          </div>

          {/* Role filter */}
          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-gray-600">Role</label>
            <div className="mt-1 flex items-center gap-2 border rounded-md px-3 py-2">
              <Filter size={18} className="text-gray-400" />
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as "" | Role);
                  setPage(1);
                }}
                className="w-full outline-none text-sm bg-transparent"
              >
                <option value="">All</option>
                <option value="user">User</option>
                <option value="affiliate">Affiliate</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Limit */}
          <div className="md:col-span-3">
            <label className="text-xs font-semibold text-gray-600">Rows</label>
            <div className="mt-1 flex items-center gap-2 border rounded-md px-3 py-2">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full outline-none text-sm bg-transparent"
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            Showing <span className="font-semibold">{rows.length}</span> of{" "}
            <span className="font-semibold">{total}</span> users
          </div>

          {tableLoading ? (
            <div className="inline-flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Loading...
            </div>
          ) : null}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr className="text-left">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-semibold">
                        {u.name?.slice(0, 1)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-gray-700">{u.phoneNumber}</td>

                  <td className="py-3 px-4">
                    <RoleBadge role={u.role} />
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <StatusBadge isDeleted={u.isDeleted} isEmailVerified={u.isEmailVerified} />
                      {u.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-700">
                          <Shield size={14} /> Protected
                        </span>
                      ) : null}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-gray-500">{u.createdAt ?? "-"}</td>

                  <td className="py-3 px-4">
                    <div className="flex justify-end items-center gap-2">
                      {/* VIEW */}
                      <button
                        onClick={() => openView(u)}
                        className="px-3 py-1.5 rounded-md border text-xs font-semibold hover:bg-gray-50 inline-flex items-center gap-2"
                        type="button"
                      >
                        <BadgeCheck size={14} />
                        View
                      </button>

                      {/* EDIT */}
                      <button
                        onClick={() => openEdit(u)}
                        className="px-3 py-1.5 rounded-md border text-xs font-semibold hover:bg-gray-50 inline-flex items-center gap-2"
                        type="button"
                      >
                        <UserCog size={14} />
                        Edit
                      </button>

                      {/* DELETE / RESTORE */}
                      {u.isDeleted ? (
                        <button
                          onClick={() => openConfirmRestore(u)}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-green-600 text-white hover:bg-green-700 inline-flex items-center gap-2"
                          type="button"
                        >
                          <RotateCcw size={14} />
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => openConfirmDelete(u)}
                          disabled={u.role === "admin"}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center gap-2 ${
                            u.role === "admin"
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                          type="button"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {!tableLoading && rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 border-t bg-white">
          <p className="text-xs text-gray-500">
            Page <span className="font-semibold">{pageSafe}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageSafe <= 1 || tableLoading}
              className={`px-3 py-2 rounded-md border text-sm font-semibold inline-flex items-center gap-2 ${
                pageSafe <= 1 || tableLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
              type="button"
            >
              <ChevronLeft size={16} />
              Prev
            </button>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageSafe >= totalPages || tableLoading}
              className={`px-3 py-2 rounded-md border text-sm font-semibold inline-flex items-center gap-2 ${
                pageSafe >= totalPages || tableLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
              type="button"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODAL */}
      <ModalShell
        open={viewOpen}
        onClose={closeView}
        title="User Details"
        icon={<BadgeCheck size={18} className="text-orange-600" />}
        maxWidth="max-w-xl"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                if (selected) openEdit(selected);
                setViewOpen(false);
              }}
              className="px-4 py-2 rounded-md border text-sm font-semibold hover:bg-gray-50"
              type="button"
              disabled={!selected}
            >
              Edit
            </button>
            <button
              onClick={closeView}
              className="px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700"
              type="button"
            >
              Close
            </button>
          </div>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg">
                {selected.name?.slice(0, 1)?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{selected.name}</p>
                <p className="text-sm text-gray-500">{selected.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border rounded-xl p-3">
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm font-semibold text-gray-800">{selected.phoneNumber}</p>
              </div>
              <div className="border rounded-xl p-3">
                <p className="text-xs text-gray-500">Joined</p>
                <p className="text-sm font-semibold text-gray-800">{selected.createdAt ?? "-"}</p>
              </div>
              <div className="border rounded-xl p-3">
                <p className="text-xs text-gray-500">Role</p>
                <div className="mt-1">
                  <RoleBadge role={selected.role} />
                </div>
              </div>
              <div className="border rounded-xl p-3">
                <p className="text-xs text-gray-500">Status</p>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge isDeleted={selected.isDeleted} isEmailVerified={selected.isEmailVerified} />
                  {selected.role === "admin" ? (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-700">
                      <Shield size={14} /> Protected
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No user selected.</p>
        )}
      </ModalShell>

      {/* EDIT MODAL */}
      <ModalShell
        open={editOpen}
        onClose={closeEdit}
        title="Edit User"
        icon={<UserCog size={18} className="text-orange-600" />}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={closeEdit}
              className="px-4 py-2 rounded-md border text-sm font-semibold hover:bg-gray-50"
              type="button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
              type="button"
              disabled={loading || !selected}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Save
            </button>
          </div>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div className="rounded-xl border p-3">
              <p className="text-sm font-semibold text-gray-800">{selected.name}</p>
              <p className="text-xs text-gray-500">
                {selected.email} • {selected.phoneNumber}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Role</label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as Role)}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none bg-transparent"
              >
                <option value="user">User</option>
                <option value="affiliate">Affiliate</option>
                <option value="admin">Admin</option>
              </select>
              {selected.role === "admin" ? (
                <p className="mt-1 text-xs text-blue-700 inline-flex items-center gap-1">
                  <Shield size={14} /> This is an admin user (handle carefully).
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-3 border rounded-xl p-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Email Verified</p>
                <p className="text-xs text-gray-500">Mark email as verified/unverified</p>
              </div>
              <button
                onClick={() => setEditVerified((v) => !v)}
                className={`px-3 py-2 rounded-md text-xs font-semibold border ${
                  editVerified ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"
                }`}
                type="button"
              >
                {editVerified ? "Verified" : "Unverified"}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 border rounded-xl p-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Account Status</p>
                <p className="text-xs text-gray-500">Soft delete / restore</p>
              </div>
              <button
                onClick={() => setEditDeleted((v) => !v)}
                disabled={selected.role === "admin"}
                className={`px-3 py-2 rounded-md text-xs font-semibold ${
                  selected.role === "admin"
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : editDeleted
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
                type="button"
              >
                {selected.role === "admin" ? "Protected" : editDeleted ? "Set Deleted" : "Set Active"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No user selected.</p>
        )}
      </ModalShell>

      {/* CONFIRM MODAL */}
      <ModalShell
        open={confirmOpen}
        onClose={closeConfirm}
        title={confirmMode === "delete" ? "Confirm Delete" : "Confirm Restore"}
        icon={<AlertTriangle size={18} className="text-orange-600" />}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={closeConfirm}
              className="px-4 py-2 rounded-md border text-sm font-semibold hover:bg-gray-50"
              type="button"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmAction}
              className={`px-4 py-2 rounded-md text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2 ${
                confirmMode === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
              }`}
              type="button"
              disabled={loading || !selected}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {confirmMode === "delete" ? "Yes, Delete" : "Yes, Restore"}
            </button>
          </div>
        }
      >
        {selected ? (
          <div className="space-y-3">
            <div className="rounded-xl border p-3">
              <p className="text-sm font-semibold text-gray-800">{selected.name}</p>
              <p className="text-xs text-gray-500">
                {selected.email} • {selected.phoneNumber}
              </p>
            </div>

            <div
              className={`rounded-xl p-3 text-sm ${
                confirmMode === "delete" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
              }`}
            >
              {confirmMode === "delete" ? (
                <p>
                  This will <span className="font-semibold">soft delete</span> the user (can be restored later).
                </p>
              ) : (
                <p>
                  This will <span className="font-semibold">restore</span> the user back to active.
                </p>
              )}
            </div>

            {selected.role === "admin" ? (
              <p className="text-xs text-blue-700 inline-flex items-center gap-1">
                <Shield size={14} /> Admin is protected from delete.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No user selected.</p>
        )}
      </ModalShell>
    </div>
  );
}

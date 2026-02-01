"use client";

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
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

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

const dummyUsers: UserRow[] = [
  {
    _id: "u1",
    name: "Sabbir Hossain",
    email: "sabbir@example.com",
    phoneNumber: "01700000001",
    role: "user",
    isDeleted: false,
    isEmailVerified: true,
    createdAt: "2026-01-25",
  },
  {
    _id: "u2",
    name: "Nusrat Jahan",
    email: "nusrat@example.com",
    phoneNumber: "01700000002",
    role: "affiliate",
    isDeleted: false,
    isEmailVerified: false,
    createdAt: "2026-01-22",
  },
  {
    _id: "u3",
    name: "Admin One",
    email: "admin@bazaarfly.com",
    phoneNumber: "01700000003",
    role: "admin",
    isDeleted: false,
    isEmailVerified: true,
    createdAt: "2026-01-01",
  },
  {
    _id: "u4",
    name: "Deleted User",
    email: "deleted@example.com",
    phoneNumber: "01700000004",
    role: "user",
    isDeleted: true,
    isEmailVerified: false,
    createdAt: "2025-12-20",
  },
];

function RoleBadge({ role }: { role: Role }) {
  const map: Record<Role, string> = {
    user: "bg-gray-100 text-gray-700",
    affiliate: "bg-orange-100 text-orange-700",
    admin: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[role]}`}
    >
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

export default function AdminUsersPage() {
  // UI state
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"" | Role>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // TODO: Replace with API data:
  // const { users, pagination } = await AccountService.getUsers({ search, role, page, limit })
  const users = dummyUsers;

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return users
      .filter((u) => (role ? u.role === role : true))
      .filter((u) => {
        if (!s) return true;
        return (
          u.name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          u.phoneNumber.toLowerCase().includes(s)
        );
      });
  }, [users, role, search]);

  // Fake pagination for UI
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageSafe = Math.min(page, totalPages);
  const start = (pageSafe - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  const handleSoftDelete = (id: string) => {
    // TODO: call AccountService.deleteUser(id)
    alert(`Soft delete user: ${id}`);
  };

  const handleRestore = (id: string) => {
    // TODO: call AccountService.restoreUser(id)
    alert(`Restore user: ${id}`);
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
            <label className="text-xs font-semibold text-gray-600">
              Search
            </label>
            <div className="mt-1 flex items-center gap-2 border rounded-md px-3 py-2 bg-white">
              <Search size={18} className="text-gray-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
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

        <div className="text-xs text-gray-500">
          Showing <span className="font-semibold">{paged.length}</span> of{" "}
          <span className="font-semibold">{total}</span> users
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
              {paged.map((u) => (
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
                      <StatusBadge
                        isDeleted={u.isDeleted}
                        isEmailVerified={u.isEmailVerified}
                      />
                      {u.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-700">
                          <Shield size={14} /> Protected
                        </span>
                      ) : null}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-gray-500">
                    {u.createdAt ?? "-"}
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex justify-end items-center gap-2">
                      <Link
                        href={`/admin/users/${u._id}`}
                        className="px-3 py-1.5 rounded-md border text-xs font-semibold hover:bg-gray-50 inline-flex items-center gap-2"
                      >
                        <BadgeCheck size={14} />
                        View
                      </Link>

                      <Link
                        href={`/admin/users/${u._id}/edit`}
                        className="px-3 py-1.5 rounded-md border text-xs font-semibold hover:bg-gray-50 inline-flex items-center gap-2"
                      >
                        <UserCog size={14} />
                        Edit
                      </Link>

                      {u.isDeleted ? (
                        <button
                          onClick={() => handleRestore(u._id)}
                          className="px-3 py-1.5 rounded-md text-xs font-semibold bg-green-600 text-white hover:bg-green-700 inline-flex items-center gap-2"
                        >
                          <RotateCcw size={14} />
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSoftDelete(u._id)}
                          disabled={u.role === "admin"}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold inline-flex items-center gap-2 ${
                            u.role === "admin"
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {paged.length === 0 ? (
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
              disabled={pageSafe <= 1}
              className={`px-3 py-2 rounded-md border text-sm font-semibold inline-flex items-center gap-2 ${
                pageSafe <= 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
            >
              <ChevronLeft size={16} />
              Prev
            </button>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageSafe >= totalPages}
              className={`px-3 py-2 rounded-md border text-sm font-semibold inline-flex items-center gap-2 ${
                pageSafe >= totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

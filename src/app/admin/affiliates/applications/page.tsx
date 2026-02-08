"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronLeft,
  CheckCircle,
  XCircle,
  MessageSquareText,
  User2,
  CalendarClock,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type ApplicationStatus = "pending" | "approved" | "rejected";

type PopulatedUser = {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
};

type ApplicationRow = {
  _id: string;
  user: PopulatedUser | string; // populated or just id
  applicationId: string;
  status: ApplicationStatus;
  message?: string;
  adminResponse?: string;
  reviewedAt?: string;
  reviewedBy?: PopulatedUser | string;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

/* ---------------- HELPERS ---------------- */
const safeUser = (u: ApplicationRow["user"]) => {
  if (!u) return null;
  if (typeof u === "string") return null;
  return u;
};

const formatDate = (d?: string) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString();
};

const badgeClass = (status: ApplicationStatus) => {
  if (status === "pending") return "bg-yellow-100 text-yellow-800";
  if (status === "approved") return "bg-green-100 text-green-800";
  return "bg-red-100 text-red-800";
};

export default function AffiliateApplicationsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<ApplicationStatus | "all">("pending");

  // action state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    let list = rows;
    if (tab !== "all") list = list.filter((r) => r.status === tab);

    if (!s) return list;

    return list.filter((r) => {
      const u = safeUser(r.user);
      return (
        r.applicationId.toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s) ||
        (r.message || "").toLowerCase().includes(s) ||
        (r.adminResponse || "").toLowerCase().includes(s) ||
        (u?.name || "").toLowerCase().includes(s) ||
        (u?.phone || "").toLowerCase().includes(s) ||
        (u?.email || "").toLowerCase().includes(s) ||
        r._id.toLowerCase().includes(s)
      );
    });
  }, [q, rows, tab]);

  const fetchData = async (status?: ApplicationStatus | "all") => {
    setLoading(true);
    try {
      const qs =
        status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
      const res = await fetch(`/api/v1/admin/affiliates/applications${qs}`, {
        cache: "no-store",
      });
      const json: ApiResponse<ApplicationRow[]> = await res.json();
      setRows(json?.data || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const openAction = (id: string, preset?: string) => {
    setActiveId(id);
    setAdminResponse(preset || "");
  };

  const closeAction = () => {
    setActiveId(null);
    setAdminResponse("");
    setSaving(false);
  };

  const updateStatus = async (id: string, status: ApplicationStatus) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/affiliates/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          adminResponse: adminResponse?.trim() || undefined,
        }),
      });

      // optimistic update
      if (res.ok) {
        const reviewedAt = new Date().toISOString();
        setRows((prev) =>
          prev.map((r) =>
            r._id === id
              ? {
                  ...r,
                  status,
                  adminResponse: adminResponse?.trim() || r.adminResponse,
                  reviewedAt,
                }
              : r
          )
        );
        closeAction();
      } else {
        setSaving(false);
      }
    } catch {
      setSaving(false);
    }
  };

  const counts = useMemo(() => {
    const c = { all: rows.length, pending: 0, approved: 0, rejected: 0 };
    rows.forEach((r) => (c[r.status] += 1));
    return c;
  }, [rows]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/affiliates"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition"
          >
            <ChevronLeft size={18} /> Back
          </Link>

          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Affiliate Applications
            </h1>
            <p className="text-sm text-gray-600">
              Review applications (approve/reject) with admin response.
            </p>
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
              placeholder="Search: APP ID / name / phone / email..."
              className="w-[320px] max-w-full pl-10 pr-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTab("pending")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
            tab === "pending" ? "bg-orange-600 text-white border-orange-600" : "bg-white hover:bg-gray-50"
          }`}
        >
          Pending ({counts.pending})
        </button>
        <button
          onClick={() => setTab("approved")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
            tab === "approved" ? "bg-orange-600 text-white border-orange-600" : "bg-white hover:bg-gray-50"
          }`}
        >
          Approved ({counts.approved})
        </button>
        <button
          onClick={() => setTab("rejected")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
            tab === "rejected" ? "bg-orange-600 text-white border-orange-600" : "bg-white hover:bg-gray-50"
          }`}
        >
          Rejected ({counts.rejected})
        </button>
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
            tab === "all" ? "bg-orange-600 text-white border-orange-600" : "bg-white hover:bg-gray-50"
          }`}
        >
          All ({counts.all})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">
                  Application
                </th>
                <th className="text-left px-4 py-3 font-semibold">User</th>
                <th className="text-left px-4 py-3 font-semibold">Message</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Applied</th>
                <th className="text-left px-4 py-3 font-semibold">Reviewed</th>
                <th className="text-right px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={7}>
                    Loading applications...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={7}>
                    No applications found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const u = safeUser(r.user);

                  return (
                    <tr key={r._id} className="hover:bg-gray-50/60 align-top">
                      {/* Application */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">
                          {r.applicationId}
                        </p>
                        <p className="text-xs text-gray-500">DB: {r._id}</p>
                      </td>

                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5 p-2 rounded-xl bg-gray-100">
                            <User2 size={16} className="text-gray-700" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {u?.name || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-600">
                              {u?.phone || "-"}{" "}
                              <span className="text-gray-300">•</span>{" "}
                              {u?.email || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Message */}
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <MessageSquareText
                            size={16}
                            className="text-gray-400 mt-1"
                          />
                          <div className="space-y-2">
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {r.message || "-"}
                            </p>

                            {r.adminResponse ? (
                              <div className="p-3 rounded-xl border bg-gray-50">
                                <p className="text-xs font-semibold text-gray-600">
                                  Admin response
                                </p>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                  {r.adminResponse}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${badgeClass(
                            r.status
                          )}`}
                        >
                          {r.status}
                        </span>
                      </td>

                      {/* Applied */}
                      <td className="px-4 py-3 text-gray-700">
                        <div className="flex items-center gap-2">
                          <CalendarClock size={16} className="text-gray-400" />
                          <span>{formatDate(r.createdAt)}</span>
                        </div>
                      </td>

                      {/* Reviewed */}
                      <td className="px-4 py-3 text-gray-700">
                        {r.reviewedAt ? formatDate(r.reviewedAt) : "-"}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right">
                        {r.status === "pending" ? (
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => openAction(r._id, r.adminResponse)}
                              className="px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-gray-50 transition"
                            >
                              Reply & Decide
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            No action
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Drawer (simple inline modal) */}
      {activeId ? (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-end sm:items-center justify-center p-3">
          <div className="w-full max-w-2xl bg-white rounded-2xl border shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Admin Response
                </p>
                <p className="text-xs text-gray-500">
                  Write a response then approve or reject the application.
                </p>
              </div>
              <button
                onClick={closeAction}
                className="px-3 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-3">
              <textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Write admin response (optional)..."
                rows={5}
                className="w-full px-4 py-3 rounded-2xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
              />

              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  disabled={saving}
                  onClick={() => updateStatus(activeId, "approved")}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60 transition"
                >
                  <CheckCircle size={18} /> Approve
                </button>

                <button
                  disabled={saving}
                  onClick={() => updateStatus(activeId, "rejected")}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition"
                >
                  <XCircle size={18} /> Reject
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Approve/Reject করলে backend এ status update হবে + reviewedAt সেট
                হবে (API অনুযায়ী)।
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Ban,
  MousePointerClick,
  TrendingUp,
  Wallet,
  Globe,
} from "lucide-react";

/* ---------------- TYPES (Model-based) ---------------- */
type AffiliateStatus = "active" | "suspended";

type PopulatedUser = {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
};

interface AffiliateRow {
  _id: string;
  user: PopulatedUser; // populated user
  affiliateCode: string;
  status: AffiliateStatus;

  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  totalWithdrawn: number;

  websiteUrl?: string;
  notes?: string;

  // virtual (we will compute in UI too)
  conversionRate?: number;
  // virtual populated wallet balance (optional)
  currentBalance?: {
    balance?: number;
  } | null;

  createdAt: string;
  updatedAt: string;
}

/* ---------------- DUMMY DATA ---------------- */
const DUMMY_AFFILIATES: AffiliateRow[] = [
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
    currentBalance: { balance: 12500 },
    createdAt: "2026-01-12T10:20:00.000Z",
    updatedAt: "2026-02-01T11:45:00.000Z",
  },
  {
    _id: "65f1a1aa12ab34cd56ef0002",
    user: {
      _id: "u002",
      name: "Nusrat Jahan",
      phone: "+8801811000002",
      email: "nusrat@gmail.com",
    },
    affiliateCode: "B1D4AA90",
    status: "active",
    totalClicks: 540,
    totalConversions: 18,
    totalEarnings: 8200,
    totalWithdrawn: 3000,
    websiteUrl: "https://facebook.com/nusrat.shop",
    notes: "Mostly FB traffic",
    currentBalance: { balance: 5200 },
    createdAt: "2026-01-19T09:10:00.000Z",
    updatedAt: "2026-02-02T08:30:00.000Z",
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
    currentBalance: { balance: 1200 },
    createdAt: "2026-01-22T12:15:00.000Z",
    updatedAt: "2026-02-01T15:05:00.000Z",
  },
  {
    _id: "65f1a1aa12ab34cd56ef0004",
    user: {
      _id: "u004",
      name: "Mehedi Hasan",
      phone: "+8801611000004",
      email: "mehedi@gmail.com",
    },
    affiliateCode: "9A22BC77",
    status: "active",
    totalClicks: 980,
    totalConversions: 31,
    totalEarnings: 14200,
    totalWithdrawn: 9000,
    websiteUrl: "https://mehedi-store.com",
    notes: "Requested payout frequently",
    currentBalance: { balance: 5200 },
    createdAt: "2026-01-09T14:05:00.000Z",
    updatedAt: "2026-01-30T16:44:00.000Z",
  },
];

/* ---------------- HELPERS ---------------- */
const PAGE_SIZE = 10;

const calcConversionRate = (clicks: number, conversions: number) => {
  if (!clicks) return 0;
  return Number(((conversions / clicks) * 100).toFixed(2));
};

const formatDate = (d?: string) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString();
};

const statusBadge = (status: AffiliateStatus) => {
  return status === "active"
    ? "bg-green-100 text-green-800"
    : "bg-red-100 text-red-800";
};

export default function AdminAffiliatesPage() {
  // using dummy data now
  const [rows, setRows] = useState<AffiliateRow[]>(DUMMY_AFFILIATES);

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<"all" | AffiliateStatus>("all");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = rows;

    if (tab !== "all") list = list.filter((r) => r.status === tab);

    if (!s) return list;

    return list.filter((r) => {
      const u = r.user;
      return (
        r.affiliateCode.toLowerCase().includes(s) ||
        r._id.toLowerCase().includes(s) ||
        (u?.name || "").toLowerCase().includes(s) ||
        (u?.phone || "").toLowerCase().includes(s) ||
        (u?.email || "").toLowerCase().includes(s) ||
        (r.websiteUrl || "").toLowerCase().includes(s)
      );
    });
  }, [q, rows, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const counts = useMemo(() => {
    const c = { all: rows.length, active: 0, suspended: 0 };
    rows.forEach((r) => {
      c[r.status] += 1;
    });
    return c;
  }, [rows]);

  const toggleStatus = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r._id === id
          ? { ...r, status: r.status === "active" ? "suspended" : "active" }
          : r
      )
    );
  };

  // reset page on filter/search change
  useMemo(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, tab]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Affiliates</h1>
          <p className="text-sm text-gray-600">
            Affiliate list (code, clicks, conversions, earnings, withdrawn, wallet balance).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Link
            href="/admin/affiliates/applications"
            className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 transition"
          >
            Applications
          </Link>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search: code / name / phone / email..."
              className="w-[320px] max-w-full pl-10 pr-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
            tab === "all"
              ? "bg-orange-600 text-white border-orange-600"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          All ({counts.all})
        </button>
        <button
          onClick={() => setTab("active")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
            tab === "active"
              ? "bg-orange-600 text-white border-orange-600"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          Active ({counts.active})
        </button>
        <button
          onClick={() => setTab("suspended")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
            tab === "suspended"
              ? "bg-orange-600 text-white border-orange-600"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          Suspended ({counts.suspended})
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Affiliate</th>
                <th className="text-left px-4 py-3 font-semibold">Code</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Clicks</th>
                <th className="text-right px-4 py-3 font-semibold">Conversions</th>
                <th className="text-right px-4 py-3 font-semibold">Conv. Rate</th>
                <th className="text-right px-4 py-3 font-semibold">Earnings</th>
                <th className="text-right px-4 py-3 font-semibold">Withdrawn</th>
                <th className="text-right px-4 py-3 font-semibold">Balance</th>
                <th className="text-left px-4 py-3 font-semibold">Website</th>
                <th className="text-left px-4 py-3 font-semibold">Joined</th>
                <th className="text-right px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {paginated.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={12}>
                    No affiliates found.
                  </td>
                </tr>
              ) : (
                paginated.map((r) => {
                  const rate =
                    typeof r.conversionRate === "number"
                      ? r.conversionRate
                      : calcConversionRate(r.totalClicks, r.totalConversions);

                  const balance =
                    typeof r.currentBalance === "object" &&
                    r.currentBalance &&
                    typeof (r.currentBalance as any).balance === "number"
                      ? Number((r.currentBalance as any).balance)
                      : Math.max(0, r.totalEarnings - r.totalWithdrawn);

                  return (
                    <tr key={r._id} className="hover:bg-gray-50/60">
                      {/* Affiliate */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">
                          {r.user?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-600">
                          {r.user?.phone || "-"}{" "}
                          <span className="text-gray-300">•</span>{" "}
                          {r.user?.email || "-"}
                        </p>
                        {r.notes ? (
                          <p className="text-xs text-gray-500 mt-1">
                            Note: {r.notes}
                          </p>
                        ) : null}
                      </td>

                      {/* Code */}
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 rounded-lg border bg-white font-mono text-xs">
                          {r.affiliateCode}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(
                            r.status
                          )}`}
                        >
                          {r.status}
                        </span>
                      </td>

                      {/* Clicks */}
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-2 justify-end font-semibold text-gray-900">
                          <MousePointerClick size={16} className="text-gray-400" />
                          {r.totalClicks.toLocaleString()}
                        </span>
                      </td>

                      {/* Conversions */}
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-2 justify-end font-semibold text-gray-900">
                          <TrendingUp size={16} className="text-gray-400" />
                          {r.totalConversions.toLocaleString()}
                        </span>
                      </td>

                      {/* Rate */}
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {rate}%
                      </td>

                      {/* Earnings */}
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        ৳{Number(r.totalEarnings || 0).toLocaleString()}
                      </td>

                      {/* Withdrawn */}
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        ৳{Number(r.totalWithdrawn || 0).toLocaleString()}
                      </td>

                      {/* Balance */}
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        <span className="inline-flex items-center gap-2 justify-end">
                          <Wallet size={16} className="text-gray-400" />
                          ৳{Number(balance || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Website */}
                      <td className="px-4 py-3">
                        {r.websiteUrl ? (
                          <a
                            href={r.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-semibold text-orange-600 hover:underline"
                          >
                            <Globe size={16} />
                            Visit
                          </a>
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3 text-gray-700">
                        {formatDate(r.createdAt)}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <Link
                            href={`/admin/affiliates/${r._id}`}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold hover:bg-orange-50 transition"
                          >
                            <Eye size={16} /> View
                          </Link>

                          <button
                            onClick={() => toggleStatus(r._id)}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                              r.status === "active"
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            {r.status === "active" ? (
                              <>
                                <Ban size={16} /> Suspend
                              </>
                            ) : (
                              <>
                                <BadgeCheck size={16} /> Activate
                              </>
                            )}
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 bg-white">
          <p className="text-xs text-gray-600">
            Page <span className="font-semibold">{page}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border disabled:opacity-40 hover:bg-gray-50 transition"
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl border disabled:opacity-40 hover:bg-gray-50 transition"
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Hint */}
      <p className="text-xs text-gray-500">
        Dummy data is used here. Later connect your API and replace{" "}
        <span className="font-mono">DUMMY_AFFILIATES</span> with fetched data.
      </p>
    </section>
  );
}

"use client";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  ImageIcon,
  Pencil,
  Plus,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

/* ---------------- TYPES ---------------- */
type BannerStatus = "active" | "inactive" | "scheduled";

type Banner = {
  _id: string;
  title: string;
  placement: "home_hero" | "home_middle" | "category_top" | "product_page";
  image: string; // url
  linkType: "url" | "category" | "product";
  linkValue: string; // url or id
  startDate?: string; // ISO
  endDate?: string; // ISO
  priority: number;
  status: BannerStatus;
  createdAt: string; // ISO
};

/* ---------------- MOCK DATA ---------------- */
const mockBanners: Banner[] = [
  {
    _id: "bnr_1",
    title: "Winter Sale 50% OFF",
    placement: "home_hero",
    image:
      "/",
    linkType: "url",
    linkValue: "https://bazaarfly.com/sale",
    priority: 1,
    status: "active",
    createdAt: "2026-02-01T10:00:00.000Z",
  },
  {
    _id: "bnr_2",
    title: "New Electronics Collection",
    placement: "home_middle",
    image:
      "/",
    linkType: "category",
    linkValue: "electronics",
    priority: 2,
    status: "scheduled",
    startDate: "2026-02-05T00:00:00.000Z",
    endDate: "2026-02-20T00:00:00.000Z",
    createdAt: "2026-02-02T09:00:00.000Z",
  },
  {
    _id: "bnr_3",
    title: "Trending Fashion",
    placement: "category_top",
    image:
      "/",
    linkType: "url",
    linkValue: "https://bazaarfly.com/fashion",
    priority: 3,
    status: "inactive",
    createdAt: "2026-01-20T14:00:00.000Z",
  },
];

const PLACEMENT_LABEL: Record<Banner["placement"], string> = {
  home_hero: "Home Hero",
  home_middle: "Home Middle",
  category_top: "Category Top",
  product_page: "Product Page",
};

const STATUS_STYLES: Record<BannerStatus, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  inactive: "bg-red-100 text-red-700 border-red-200",
  scheduled: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString();
};

export default function AdminBannersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<BannerStatus | "all">("all");
  const [placement, setPlacement] = useState<Banner["placement"] | "all">(
    "all"
  );

  // pagination (mock)
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return mockBanners
      .filter((b) => {
        const matchQuery =
          !query ||
          b.title.toLowerCase().includes(query) ||
          b.linkValue.toLowerCase().includes(query);

        const matchStatus = status === "all" ? true : b.status === status;
        const matchPlacement =
          placement === "all" ? true : b.placement === placement;

        return matchQuery && matchStatus && matchPlacement;
      })
      .sort((a, b) => a.priority - b.priority);
  }, [q, status, placement]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  const items = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <section className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ImageIcon className="text-orange-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Banners</h1>
            <p className="text-sm text-gray-500">
              Manage homepage & campaign banners
            </p>
          </div>
        </div>

        <Link
          href="/admin/banners/new"
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          <Plus size={16} />
          Add Banner
        </Link>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white border rounded-2xl shadow-sm p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        {/* SEARCH */}
        <div className="relative w-full md:w-[420px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title or link..."
            className="w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
          />
        </div>

        {/* DROPDOWNS */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as BannerStatus | "all");
              setPage(1);
            }}
            className="border rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={placement}
            onChange={(e) => {
              setPlacement(e.target.value as Banner["placement"] | "all");
              setPage(1);
            }}
            className="border rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
          >
            <option value="all">All Placements</option>
            <option value="home_hero">Home Hero</option>
            <option value="home_middle">Home Middle</option>
            <option value="category_top">Category Top</option>
            <option value="product_page">Product Page</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-orange-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Banner</th>
                <th className="px-4 py-3 text-left">Placement</th>
                <th className="px-4 py-3 text-left">Link</th>
                <th className="px-4 py-3 text-center">Priority</th>
                <th className="px-4 py-3 text-center">Schedule</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((b) => (
                <tr
                  key={b._id}
                  className="border-t hover:bg-orange-50/40 transition"
                >
                  {/* Banner */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-10 rounded-lg overflow-hidden border bg-gray-50">
                        <Image
                          src={b.image}
                          alt={b.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {b.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          Created: {formatDate(b.createdAt)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Placement */}
                  <td className="px-4 py-3 text-gray-700">
                    {PLACEMENT_LABEL[b.placement]}
                  </td>

                  {/* Link */}
                  <td className="px-4 py-3">
                    <div className="text-gray-800 font-medium">
                      {b.linkType.toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500 break-all">
                      {b.linkValue}
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3 text-center font-semibold text-gray-800">
                    {b.priority}
                  </td>

                  {/* Schedule */}
                  <td className="px-4 py-3 text-center text-gray-700">
                    {b.status === "scheduled" ? (
                      <div className="text-xs">
                        <div>
                          <span className="font-semibold">From:</span>{" "}
                          {formatDate(b.startDate)}
                        </div>
                        <div>
                          <span className="font-semibold">To:</span>{" "}
                          {formatDate(b.endDate)}
                        </div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 text-xs rounded-full border font-semibold ${
                        STATUS_STYLES[b.status]
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/admin/banners/${b._id}`}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-50 transition"
                        title="View"
                      >
                        <Eye size={14} />
                        <span className="hidden sm:inline">View</span>
                      </Link>

                      <Link
                        href={`/admin/banners/${b._id}/edit`}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-orange-700 bg-orange-50 border-orange-200 hover:bg-orange-100 transition"
                        title="Edit"
                      >
                        <Pencil size={14} />
                        <span className="hidden sm:inline">Edit</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No banners found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{items.length}</span> of{" "}
            <span className="font-semibold">{filtered.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={page <= 1}
              className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="text-sm font-semibold text-gray-700">
              Page {page} / {totalPages}
            </div>

            <button
              onClick={goNext}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

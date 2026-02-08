"use client";

import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  ImageIcon,
  Pencil,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

type BannerStatus = "active" | "inactive" | "scheduled";

type Banner = {
  _id: string;
  title: string;
  placement: "home_hero" | "home_middle" | "category_top" | "product_page";
  image: string;
  linkType: "url" | "category" | "product";
  linkValue: string;
  startDate?: string;
  endDate?: string;
  priority: number;
  status: BannerStatus;
  createdAt: string;
};

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
  return new Date(iso).toLocaleString();
};

export default function BannerDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const banner = useMemo(() => mockBanners.find((b) => b._id === id), [id]);
  const loading = !id;
  const notFound = !!id && !banner;

  const scheduleText = useMemo(() => {
    if (!banner) return "-";
    if (banner.status !== "scheduled") return "Not Scheduled";
    return `${formatDate(banner.startDate)} → ${formatDate(banner.endDate)}`;
  }, [banner]);

  const handleDelete = async () => {
    const ok = confirm("Are you sure you want to delete this banner?");
    if (!ok) return;

    // TODO: connect delete API
    console.log("DELETE BANNER:", id);
    alert("Deleted (mock). Connect API ✅");
    router.push("/admin/banners");
  };

  if (loading) {
    return (
      <section className="p-6">
        <div className="bg-white border rounded-2xl p-6 text-gray-600">
          Loading banner...
        </div>
      </section>
    );
  }

  if (notFound || !banner) {
    return (
      <section className="p-6 space-y-4">
        <Link
          href="/admin/banners"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-orange-600 transition"
        >
          <ArrowLeft size={16} className="text-orange-600" />
          Back
        </Link>

        <div className="bg-white border rounded-2xl p-6 text-gray-700">
          Banner not found.
        </div>
      </section>
    );
  }

  return (
    <section className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ImageIcon className="text-orange-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{banner.title}</h1>
            <p className="text-sm text-gray-500">
              Placement: {PLACEMENT_LABEL[banner.placement]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/banners"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <ArrowLeft size={16} />
            Back
          </Link>

          <Link
            href={`/admin/banners/${banner._id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 text-sm font-semibold hover:bg-orange-100 transition"
          >
            <Pencil size={16} />
            Edit
          </Link>

          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* IMAGE */}
        <div className="lg:col-span-2 bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="relative w-full h-[320px] bg-gray-50">
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 800px"
            />
          </div>

          <div className="p-5 border-t space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span
                className={`px-2 py-1 text-xs rounded-full border font-semibold ${
                  STATUS_STYLES[banner.status]
                }`}
              >
                {banner.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Priority</span>
              <span className="text-sm font-semibold text-gray-800">
                {banner.priority}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-gray-600">Link</span>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">
                  {banner.linkType.toUpperCase()}
                </div>
                <div className="text-xs text-gray-500 break-all">
                  {banner.linkValue}
                </div>
                {banner.linkType === "url" && (
                  <a
                    href={banner.linkValue}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:underline mt-1"
                  >
                    <ExternalLink size={12} />
                    Open Link
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* META */}
        <div className="bg-white border rounded-2xl shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 text-gray-800 font-semibold">
            <Calendar size={16} className="text-orange-600" />
            Schedule
          </div>

          <div className="text-sm text-gray-700">
            <div className="font-semibold">Time</div>
            <div className="text-gray-600 text-xs mt-1">{scheduleText}</div>
          </div>

          <div className="text-sm text-gray-700">
            <div className="font-semibold">Created</div>
            <div className="text-gray-600 text-xs mt-1">
              {formatDate(banner.createdAt)}
            </div>
          </div>

          <div className="text-sm text-gray-700">
            <div className="font-semibold">Placement</div>
            <div className="text-gray-600 text-xs mt-1">
              {PLACEMENT_LABEL[banner.placement]}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

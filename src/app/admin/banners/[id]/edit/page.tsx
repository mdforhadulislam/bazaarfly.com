"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ImageIcon, Save, Trash2 } from "lucide-react";

type BannerStatus = "active" | "inactive" | "scheduled";
type BannerPlacement = "home_hero" | "home_middle" | "category_top" | "product_page";
type LinkType = "url" | "category" | "product";

type Banner = {
  _id: string;
  title: string;
  placement: BannerPlacement;
  image: string;
  linkType: LinkType;
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
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80",
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
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",
    linkType: "category",
    linkValue: "electronics",
    priority: 2,
    status: "scheduled",
    startDate: "2026-02-05T00:00:00.000Z",
    endDate: "2026-02-20T00:00:00.000Z",
    createdAt: "2026-02-02T09:00:00.000Z",
  },
];

const PLACEMENT_LABEL: Record<BannerPlacement, string> = {
  home_hero: "Home Hero",
  home_middle: "Home Middle",
  category_top: "Category Top",
  product_page: "Product Page",
};

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [title, setTitle] = useState("");
  const [placement, setPlacement] = useState<BannerPlacement>("home_hero");
  const [image, setImage] = useState("");
  const [linkType, setLinkType] = useState<LinkType>("url");
  const [linkValue, setLinkValue] = useState("");
  const [priority, setPriority] = useState<number>(1);
  const [status, setStatus] = useState<BannerStatus>("active");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    setLoading(true);

    const found = mockBanners.find((b) => b._id === id);

    if (!found) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setNotFound(false);
    setTitle(found.title);
    setPlacement(found.placement);
    setImage(found.image);
    setLinkType(found.linkType);
    setLinkValue(found.linkValue);
    setPriority(found.priority);
    setStatus(found.status);
    setStartDate(found.startDate ? found.startDate.slice(0, 16) : "");
    setEndDate(found.endDate ? found.endDate.slice(0, 16) : "");

    setLoading(false);
  }, [id]);

  const showSchedule = useMemo(() => status === "scheduled", [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      _id: id,
      title: title.trim(),
      placement,
      image: image.trim(),
      linkType,
      linkValue: linkValue.trim(),
      priority,
      status,
      startDate: showSchedule ? startDate : undefined,
      endDate: showSchedule ? endDate : undefined,
    };

    // TODO: connect update API
    console.log("UPDATE BANNER =>", payload);

    alert("Banner updated (mock). Connect API ✅");
    router.push(`/admin/banners/${id}`);
  };

  const handleDelete = async () => {
    const ok = confirm("Are you sure you want to delete this banner?");
    if (!ok) return;

    // TODO: connect delete API
    console.log("DELETE BANNER =>", id);

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

  if (notFound) {
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
            <h1 className="text-2xl font-bold text-gray-800">Edit Banner</h1>
            <p className="text-sm text-gray-500">
              Update banner and campaign settings
            </p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-2xl shadow-sm p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Placement</label>
            <select
              value={placement}
              onChange={(e) => setPlacement(e.target.value as BannerPlacement)}
              className="w-full border rounded-xl px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            >
              {Object.entries(PLACEMENT_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Image URL</label>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Priority</label>
            <input
              type="number"
              min={1}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Link Type</label>
            <select
              value={linkType}
              onChange={(e) => setLinkType(e.target.value as any)}
              className="w-full border rounded-xl px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            >
              <option value="url">URL</option>
              <option value="category">Category</option>
              <option value="product">Product</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Link Value {linkType === "url" ? "(URL)" : "(slug / id)"}
            </label>
            <input
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full border rounded-xl px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            >
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className={`space-y-2 ${showSchedule ? "" : "opacity-50"}`}>
            <label className="text-sm font-semibold text-gray-700">Start Date</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={!showSchedule}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            />
          </div>

          <div className={`space-y-2 ${showSchedule ? "" : "opacity-50"}`}>
            <label className="text-sm font-semibold text-gray-700">End Date</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={!showSchedule}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href={`/admin/banners/${id}`}
            className="px-4 py-2 rounded-xl border text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition"
          >
            <Save size={16} />
            Update Banner
          </button>
        </div>
      </form>
    </section>
  );
}

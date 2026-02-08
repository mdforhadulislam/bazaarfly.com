"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ImageIcon, Save } from "lucide-react";

type BannerStatus = "active" | "inactive" | "scheduled";

type BannerPlacement = "home_hero" | "home_middle" | "category_top" | "product_page";

type LinkType = "url" | "category" | "product";

const PLACEMENT_LABEL: Record<BannerPlacement, string> = {
  home_hero: "Home Hero",
  home_middle: "Home Middle",
  category_top: "Category Top",
  product_page: "Product Page",
};

export default function NewBannerPage() {
  const [title, setTitle] = useState("");
  const [placement, setPlacement] = useState<BannerPlacement>("home_hero");
  const [image, setImage] = useState(""); // later: upload
  const [linkType, setLinkType] = useState<LinkType>("url");
  const [linkValue, setLinkValue] = useState("");
  const [priority, setPriority] = useState<number>(1);
  const [status, setStatus] = useState<BannerStatus>("active");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const showSchedule = useMemo(() => status === "scheduled", [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
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

    // TODO: connect create API
    console.log("CREATE BANNER =>", payload);
    alert("Banner created (mock). Connect API ✅");
  };

  return (
    <section className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ImageIcon className="text-orange-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Create Banner</h1>
            <p className="text-sm text-gray-500">Add a new banner for campaigns</p>
          </div>
        </div>

        <Link
          href="/admin/banners"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
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
              placeholder="e.g., Winter Sale 50% OFF"
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
              placeholder="https://..."
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            />
            <p className="text-xs text-gray-500">
              Later we will add Cloudinary upload.
            </p>
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
              placeholder={linkType === "url" ? "https://..." : "electronics / productId"}
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
            href="/admin/banners"
            className="px-4 py-2 rounded-xl border text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition"
          >
            <Save size={16} />
            Save Banner
          </button>
        </div>
      </form>
    </section>
  );
}

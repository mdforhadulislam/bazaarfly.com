"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, UploadCloud, Save } from "lucide-react";

type Category = {
  _id: string;
  name: string;
  slug: string;
  level: number;
  priority: number;
  isActive: boolean;
  parent?: string | null;
};

const mockCategories: Category[] = [
  { _id: "1", name: "Electronics", slug: "electronics", level: 1, priority: 1, isActive: true },
  { _id: "2", name: "Fashion", slug: "fashion", level: 1, priority: 2, isActive: true },
  { _id: "3", name: "Home & Living", slug: "home-living", level: 1, priority: 3, isActive: true },
];

const toSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export default function NewCategoryPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parent, setParent] = useState<string>("");
  const [priority, setPriority] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  // If parent selected => child level = parent level + 1 else 1
  const computedLevel = useMemo(() => {
    if (!parent) return 1;
    const p = mockCategories.find((c) => c._id === parent);
    return (p?.level ?? 1) + 1;
  }, [parent]);

  const handleAutoSlug = (val: string) => {
    setName(val);
    setSlug(toSlug(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      parent: parent || null,
      level: computedLevel,
      priority,
      isActive,
      // image/banner upload later
    };

    // TODO: Replace with real API call
    console.log("CREATE CATEGORY =>", payload);

    alert("Category created (mock). Now connect API ✅");
  };

  return (
    <section className="p-6 space-y-6">
      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/category"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-orange-600 transition"
          >
            <ArrowLeft size={16} className="text-orange-600" />
            Back
          </Link>

          <h1 className="text-2xl font-bold text-gray-800">Create New Category</h1>
        </div>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-2xl shadow-sm p-6 space-y-6"
      >
        {/* BASIC INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Category Name</label>
            <input
              value={name}
              onChange={(e) => handleAutoSlug(e.target.value)}
              placeholder="e.g., Electronics"
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(toSlug(e.target.value))}
              placeholder="e.g., electronics"
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              required
            />
            <p className="text-xs text-gray-500">
              URL friendly. Auto-generate from name, but you can edit.
            </p>
          </div>
        </div>

        {/* PARENT / LEVEL / PRIORITY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Parent Category</label>
            <select
              value={parent}
              onChange={(e) => setParent(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            >
              <option value="">No Parent (Top Level)</option>
              {mockCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} (Level {c.level})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Level</label>
            <input
              value={computedLevel}
              disabled
              className="w-full border rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-700"
            />
            <p className="text-xs text-gray-500">
              Auto calculated based on parent.
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

        {/* STATUS + IMAGE PLACEHOLDER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Status</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsActive(true)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                  isActive
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-white hover:bg-gray-50 text-gray-700"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setIsActive(false)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                  !isActive
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-white hover:bg-gray-50 text-gray-700"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Image / Banner</label>
            <div className="border rounded-2xl p-4 bg-orange-50/30 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Upload will be added with Cloudinary later.
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition"
              >
                <UploadCloud size={16} />
                Upload
              </button>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/category"
            className="px-4 py-2 rounded-xl border text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition"
          >
            <Save size={16} />
            Save Category
          </button>
        </div>
      </form>
    </section>
  );
}

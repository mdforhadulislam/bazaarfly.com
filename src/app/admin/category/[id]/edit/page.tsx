"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Trash2, FolderTree } from "lucide-react";

type Category = {
  _id: string;
  name: string;
  slug: string;
  level: number;
  priority: number;
  isActive: boolean;
  parent?: string | null;

  image?: string;
  banner?: string;
};

const mockCategories: Category[] = [
  { _id: "1", name: "Electronics", slug: "electronics", level: 1, priority: 1, isActive: true },
  { _id: "2", name: "Mobile Phones", slug: "mobile-phones", level: 2, priority: 2, isActive: true, parent: "1" },
  { _id: "3", name: "Fashion", slug: "fashion", level: 1, priority: 3, isActive: false },
];

const toSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parent, setParent] = useState<string>("");
  const [priority, setPriority] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  // ---------------------------------------
  // LOAD CATEGORY (mock for now)
  // ---------------------------------------
  useEffect(() => {
    setLoading(true);

    const current = mockCategories.find((c) => c._id === id);

    if (!current) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setNotFound(false);
    setName(current.name);
    setSlug(current.slug);
    setParent(current.parent ?? "");
    setPriority(current.priority);
    setIsActive(current.isActive);

    setLoading(false);
  }, [id]);

  // computed level based on parent
  const computedLevel = useMemo(() => {
    if (!parent) return 1;
    const p = mockCategories.find((c) => c._id === parent);
    return (p?.level ?? 1) + 1;
  }, [parent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      _id: id,
      name: name.trim(),
      slug: slug.trim(),
      parent: parent || null,
      level: computedLevel,
      priority,
      isActive,
    };

    // TODO: Replace with real API call
    console.log("UPDATE CATEGORY =>", payload);

    alert("Category updated (mock). Now connect API ✅");
    router.push("/admin/category");
  };

  const handleDelete = async () => {
    const ok = confirm("Are you sure you want to delete this category?");
    if (!ok) return;

    // TODO: Replace with real delete API call
    console.log("DELETE CATEGORY =>", id);

    alert("Category deleted (mock). Now connect API ✅");
    router.push("/admin/category");
  };

  if (loading) {
    return (
      <section className="p-6">
        <div className="bg-white border rounded-2xl p-6 text-gray-600">
          Loading category...
        </div>
      </section>
    );
  }

  if (notFound) {
    return (
      <section className="p-6 space-y-4">
        <Link
          href="/admin/category"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-orange-600 transition"
        >
          <ArrowLeft size={16} className="text-orange-600" />
          Back
        </Link>

        <div className="bg-white border rounded-2xl p-6 text-gray-700">
          Category not found.
        </div>
      </section>
    );
  }

  return (
    <section className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderTree className="text-orange-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Edit Category</h1>
            <p className="text-sm text-gray-500">Update your category details</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/category"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <ArrowLeft size={16} />
            Back
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

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-2xl shadow-sm p-6 space-y-6"
      >
        {/* BASIC */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Category Name
            </label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(toSlug(e.target.value));
              }}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              placeholder="e.g., Electronics"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(toSlug(e.target.value))}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
              placeholder="e.g., electronics"
              required
            />
            <p className="text-xs text-gray-500">
              Auto-generate from name, but you can edit.
            </p>
          </div>
        </div>

        {/* PARENT / LEVEL / PRIORITY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Parent Category
            </label>
            <select
              value={parent}
              onChange={(e) => setParent(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-sm bg-white outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            >
              <option value="">No Parent (Top Level)</option>
              {mockCategories
                .filter((c) => c._id !== id) // avoid self-parent
                .map((c) => (
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Priority
            </label>
            <input
              type="number"
              min={1}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
            />
          </div>
        </div>

        {/* STATUS */}
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
            Update Category
          </button>
        </div>
      </form>
    </section>
  );
}

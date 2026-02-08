"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, X, Tag as TagIcon } from "lucide-react";

type TagRow = {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

function slugifyLite(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminTagsPage() {
  const [q, setQ] = useState("");
  const [tags, setTags] = useState<TagRow[]>([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selected, setSelected] = useState<TagRow | null>(null);

  // form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isActive, setIsActive] = useState(true);

  // ---- helpers ----
  const resetForm = () => {
    setName("");
    setSlug("");
    setIsActive(true);
    setSelected(null);
  };

  const openCreateModal = () => {
    resetForm();
    setOpenCreate(true);
  };

  const openEditModal = (t: TagRow) => {
    setSelected(t);
    setName(t.name);
    setSlug(t.slug);
    setIsActive(t.isActive);
    setOpenEdit(true);
  };

  const closeCreate = () => {
    setOpenCreate(false);
    resetForm();
  };

  const closeEdit = () => {
    setOpenEdit(false);
    resetForm();
  };

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tag", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Failed to load tags");

      // assuming: { success, message, data }
      setTags(Array.isArray(data?.data) ? data.data : []);
    } catch (e: any) {
      alert(e?.message || "Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return tags;
    return tags.filter(
      (t) => t.name.toLowerCase().includes(s) || t.slug.toLowerCase().includes(s)
    );
  }, [q, tags]);

  // ---- actions ----
  const handleCreate = async () => {
    const n = name.trim();
    if (!n) return alert("Tag name is required");

    const s = (slug.trim() ? slug : slugifyLite(n)).toLowerCase();

    // quick client-side duplicate check
    if (tags.some((t) => t.slug === s)) return alert("This slug already exists");

    try {
      const res = await fetch("/api/tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, slug: s, isActive }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to create tag");

      setTags((prev) => [data.data as TagRow, ...prev]);
      closeCreate();
    } catch (e: any) {
      alert(e?.message || "Failed to create tag");
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;

    const n = name.trim();
    if (!n) return alert("Tag name is required");

    const s = (slug.trim() ? slug : slugifyLite(n)).toLowerCase();

    // client-side slug conflict check (ignore own id)
    if (tags.some((t) => t.slug === s && t._id !== selected._id)) {
      return alert("This slug already exists");
    }

    try {
      const res = await fetch(`/api/tag/${selected.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, slug: s, isActive }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update tag");

      setTags((prev) =>
        prev.map((t) => (t._id === selected._id ? (data.data as TagRow) : t))
      );

      closeEdit();
    } catch (e: any) {
      alert(e?.message || "Failed to update tag");
    }
  };

  const handleDelete = async (t: TagRow) => {
    const ok = confirm("Are you sure you want to delete this tag?");
    if (!ok) return;

    try {
      const res = await fetch(`/api/tag/${t.slug}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to delete tag");

      setTags((prev) => prev.filter((x) => x._id !== t._id));
    } catch (e: any) {
      alert(e?.message || "Failed to delete tag");
    }
  };

  const toggleActive = async (t: TagRow) => {
    try {
      const res = await fetch(`/api/tag/${t.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: t.name,
          slug: t.slug,
          isActive: !t.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to toggle status");

      setTags((prev) => prev.map((x) => (x._id === t._id ? (data.data as TagRow) : x)));
    } catch (e: any) {
      alert(e?.message || "Failed to toggle status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Tags</h1>
          <p className="text-sm text-gray-500">Manage product tags</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-3 py-2 rounded-md text-sm font-semibold bg-orange-600 text-white hover:bg-orange-700 transition inline-flex items-center gap-2"
        >
          <Plus size={16} />
          Create Tag
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <label className="text-xs font-semibold text-gray-600">Search</label>
        <div className="mt-1 flex items-center gap-2 border rounded-md px-3 py-2 bg-white">
          <Search size={18} className="text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or slug..."
            className="w-full outline-none text-sm"
          />
        </div>

        <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
          {loading ? (
            <span className="font-semibold">Loading...</span>
          ) : (
            <>
              Total: <span className="font-semibold">{filtered.length}</span>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr className="text-left">
                <th className="py-3 px-4">Tag</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    Loading tags...
                  </td>
                </tr>
              ) : (
                <>
                  {filtered.map((t) => (
                    <tr key={t._id} className="border-t">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                            <TagIcon size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{t.name}</p>
                            <p className="text-xs text-gray-500">ID: {t._id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-gray-700">{t.slug}</td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleActive(t)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            t.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                          title="Toggle Active"
                        >
                          {t.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-gray-500">
                        {t.createdAt ? String(t.createdAt).slice(0, 10) : "-"}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => openEditModal(t)}
                            className="px-3 py-1.5 rounded-md border text-xs font-semibold hover:bg-gray-50 inline-flex items-center gap-2"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(t)}
                            className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 inline-flex items-center gap-2"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-gray-500">
                        No tags found.
                      </td>
                    </tr>
                  ) : null}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {openCreate ? (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-xl border shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-800">Create Tag</h3>
              <button onClick={closeCreate} className="p-2 rounded-md hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">Name</label>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSlug(slugifyLite(e.target.value));
                  }}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                  placeholder="e.g. Trending"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                  placeholder="e.g. trending"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Auto-generated from name, you can edit.
                </p>
              </div>

              <div className="flex items-center justify-between border rounded-md px-3 py-2">
                <p className="text-sm text-gray-700">Active</p>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => setIsActive((v) => !v)}
                />
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <button onClick={closeCreate} className="px-3 py-2 rounded-md text-sm border hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-3 py-2 rounded-md text-sm font-semibold bg-orange-600 text-white hover:bg-orange-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* EDIT MODAL */}
      {openEdit ? (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white rounded-xl border shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-800">Edit Tag</h3>
              <button onClick={closeEdit} className="p-2 rounded-md hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">Name</label>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSlug(slugifyLite(e.target.value));
                  }}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                />
              </div>

              <div className="flex items-center justify-between border rounded-md px-3 py-2">
                <p className="text-sm text-gray-700">Active</p>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={() => setIsActive((v) => !v)}
                />
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <button onClick={closeEdit} className="px-3 py-2 rounded-md text-sm border hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-3 py-2 rounded-md text-sm font-semibold bg-orange-600 text-white hover:bg-orange-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

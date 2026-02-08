"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Layers,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Loader2,
  RefreshCcw,
  UploadCloud,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type CategoryDoc = {
  _id: string;
  name: string;
  slug: string;
  parent?: string | null; // ObjectId string
  isActive: boolean;
  priority: number;
  image?: string;
  banner?: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CategoryRow = CategoryDoc & {
  level: number; // computed (0 root, 1+ child)
  parentName?: string | null;
};

/* ---------------- HELPERS ---------------- */
function slugifyLite(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function safeSlug(slug: string) {
  // sanitize + encode (important)
  return encodeURIComponent(slug.trim().toLowerCase());
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
      <CheckCircle size={14} />
      active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
      <XCircle size={14} />
      inactive
    </span>
  );
}

function computeLevel(id: string, byId: Map<string, CategoryDoc>) {
  let lvl = 0;
  let cur = byId.get(id);
  const seen = new Set<string>();
  while (cur?.parent) {
    if (seen.has(cur._id)) break;
    seen.add(cur._id);
    lvl += 1;
    cur = byId.get(cur.parent);
  }
  return lvl;
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    ...(init || {}),
    headers: {
      ...(init?.headers || {}),
      ...(init?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
    },
  });

  const json = await res.json().catch(() => ({} as any));

  if (!res.ok) {
    const msg = json?.message || json?.msg || json?.error || "Request failed";
    throw new Error(msg);
  }

  // supports {success,message,data} or raw payload
  return (json?.data ?? json) as T;
}

/**
 * Upload directly to Cloudinary via your API:
 * PATCH /api/category/[slug]?type=image|banner|icon
 * Backend uploads to Cloudinary and updates category field in DB.
 * Returns updated category doc (as your successResponse returns).
 */
async function uploadCategoryAsset(
  slug: string,
  type: "image" | "banner" | "icon",
  file: File
): Promise<CategoryDoc> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`/api/category/${safeSlug(slug)}?type=${type}`, {
    method: "PATCH",
    body: form,
    credentials: "include",
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json?.message || json?.msg || "Upload failed");
  }

  // Most likely: { success, message, data: updatedCategory }
  return (json?.data ?? json) as CategoryDoc;
}

/* ---------------- MODAL ---------------- */
function Modal({
  open,
  title,
  children,
  onClose,
  footer,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <p className="font-semibold text-gray-800">{title}</p>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md border text-sm font-semibold hover:bg-gray-50"
              type="button"
            >
              Close
            </button>
          </div>

          <div className="p-5">{children}</div>

          {footer ? <div className="p-4 border-t bg-white">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function AdminCategoryPage() {
  const [categoriesRaw, setCategoriesRaw] = useState<CategoryDoc[]>([]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");
  const [parent, setParent] = useState<string>(""); // parentId filter

  // Modal states
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);

  // Create form
  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState(""); // preview only
  const [createParentId, setCreateParentId] = useState<string>("");
  const [createActive, setCreateActive] = useState(true);
  const [createPriority, setCreatePriority] = useState(1);

  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [createBannerFile, setCreateBannerFile] = useState<File | null>(null);

  // Upload state
  const [uploading, setUploading] = useState<{
    createImage?: boolean;
    createBanner?: boolean;
    editImage?: boolean;
    editBanner?: boolean;
  }>({});

  // Edit form
  const [editName, setEditName] = useState("");
  const [editParentId, setEditParentId] = useState<string>("");
  const [editActive, setEditActive] = useState(true);
  const [editPriority, setEditPriority] = useState(1);

  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editBannerFile, setEditBannerFile] = useState<File | null>(null);

  // preview urls
  const [createImagePreview, setCreateImagePreview] = useState<string>("");
  const [createBannerPreview, setCreateBannerPreview] = useState<string>("");
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const [editBannerPreview, setEditBannerPreview] = useState<string>("");

  // revoke objectURLs
  useEffect(() => {
    if (!createImageFile) return;
    const url = URL.createObjectURL(createImageFile);
    setCreateImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [createImageFile]);

  useEffect(() => {
    if (!createBannerFile) return;
    const url = URL.createObjectURL(createBannerFile);
    setCreateBannerPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [createBannerFile]);

  useEffect(() => {
    if (!editImageFile) return;
    const url = URL.createObjectURL(editImageFile);
    setEditImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [editImageFile]);

  useEffect(() => {
    if (!editBannerFile) return;
    const url = URL.createObjectURL(editBannerFile);
    setEditBannerPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [editBannerFile]);

  /* ---------------- LOAD ---------------- */
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<{ categories: CategoryDoc[]; tree?: any }>(
        "/api/category"
      );
      const list = Array.isArray(data.categories) ? data.categories : [];
      setCategoriesRaw(list);
    } catch (e: any) {
      console.log(e);
      alert(e?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  /* ---------------- DERIVED ---------------- */
  const categories: CategoryRow[] = useMemo(() => {
    const byId = new Map<string, CategoryDoc>();
    for (const c of categoriesRaw) byId.set(c._id, c);

    return categoriesRaw.map((c) => {
      const parentDoc = c.parent ? byId.get(c.parent) : null;
      return {
        ...c,
        level: computeLevel(c._id, byId),
        parentName: parentDoc?.name ?? null,
      };
    });
  }, [categoriesRaw]);

  const rootOptions = useMemo(() => {
    return categories
      .filter((c) => !c.parent)
      .sort((a, b) => a.priority - b.priority)
      .map((c) => ({ id: c._id, name: c.name, slug: c.slug }));
  }, [categories]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();

    return categories
      .filter((c) =>
        status ? (status === "active" ? c.isActive : !c.isActive) : true
      )
      .filter((c) => (parent ? c.parent === parent : true))
      .filter((c) => {
        if (!s) return true;
        return (
          c.name.toLowerCase().includes(s) ||
          c.slug.toLowerCase().includes(s) ||
          (c.parentName || "").toLowerCase().includes(s)
        );
      })
      .sort((a, b) => a.priority - b.priority);
  }, [categories, search, status, parent]);

  /* ---------------- FORM HELPERS ---------------- */
  const resetCreateForm = () => {
    setCreateName("");
    setCreateSlug("");
    setCreateParentId("");
    setCreateActive(true);
    setCreatePriority(1);
    setCreateImageFile(null);
    setCreateBannerFile(null);
    setCreateImagePreview("");
    setCreateBannerPreview("");
  };

  const openEditModal = (row: CategoryRow) => {
    setEditing(row);
    setEditName(row.name);
    setEditParentId(row.parent || "");
    setEditActive(row.isActive);
    setEditPriority(row.priority);
    setEditImageFile(null);
    setEditBannerFile(null);
    setEditImagePreview("");
    setEditBannerPreview("");
    setOpenEdit(true);
  };

  /* ---------------- ACTIONS ---------------- */

  const handleCreate = async () => {
    const name = createName.trim();
    if (!name) return alert("Category name required");

    try {
      setBusy(true);

      // Create category first
      const created = await apiFetch<CategoryDoc>("/api/category", {
        method: "POST",
        body: JSON.stringify({
          name,
          parent: createParentId || null,
          priority: Math.max(1, Number(createPriority || 1)),
          isActive: createActive,
        }),
      });

      // Then upload assets (optional) -> directly cloudinary + db update
      if (createImageFile) {
        setUploading((p) => ({ ...p, createImage: true }));
        await uploadCategoryAsset(created.slug, "image", createImageFile);
        setUploading((p) => ({ ...p, createImage: false }));
      }
      if (createBannerFile) {
        setUploading((p) => ({ ...p, createBanner: true }));
        await uploadCategoryAsset(created.slug, "banner", createBannerFile);
        setUploading((p) => ({ ...p, createBanner: false }));
      }

      setOpenCreate(false);
      resetCreateForm();
      await loadCategories();
    } catch (e: any) {
      console.log(e);
      alert(e?.message || "Failed to create category");
    } finally {
      setBusy(false);
      setUploading((p) => ({ ...p, createImage: false, createBanner: false }));
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;

    const name = editName.trim();
    if (!name) return alert("Category name required");

    try {
      setBusy(true);

      // Update main info by slug
      const updated = await apiFetch<CategoryDoc>(
        `/api/category/${safeSlug(editing.slug)}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name,
            parent: editParentId || null,
            priority: Math.max(1, Number(editPriority || 1)),
            isActive: editActive,
          }),
        }
      );

      // Upload assets if selected
      if (editImageFile) {
        setUploading((p) => ({ ...p, editImage: true }));
        await uploadCategoryAsset(updated.slug, "image", editImageFile);
        setUploading((p) => ({ ...p, editImage: false }));
      }
      if (editBannerFile) {
        setUploading((p) => ({ ...p, editBanner: true }));
        await uploadCategoryAsset(updated.slug, "banner", editBannerFile);
        setUploading((p) => ({ ...p, editBanner: false }));
      }

      setOpenEdit(false);
      setEditing(null);
      setEditImageFile(null);
      setEditBannerFile(null);
      await loadCategories();
    } catch (e: any) {
      console.log(e);
      alert(e?.message || "Failed to update category");
    } finally {
      setBusy(false);
      setUploading((p) => ({ ...p, editImage: false, editBanner: false }));
    }
  };
const handleDelete = async (slug: string) => {
  const ok = confirm(`Delete this category? (${slug})`);
  if (!ok) return;

  try {
    setBusy(true);

    await apiFetch<{ message: string }>(
      `/api/category/${safeSlug(slug)}`,
      { method: "DELETE" }
    );

    alert("Category deleted successfully ✅");
    await loadCategories();
  } catch (e: any) {
    console.log("DELETE ERROR:", e);
    alert(`Delete failed: ${e?.message || "Unknown error"}`);
  } finally {
    setBusy(false);
  }
};


  const handleToggleActive = async (row: CategoryRow) => {
    try {
      setBusy(true);
      await apiFetch(`/api/category/${safeSlug(row.slug)}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !row.isActive }),
      });
      await loadCategories();
    } catch (e: any) {
      console.log(e);
      alert(e?.message || "Failed to update status");
    } finally {
      setBusy(false);
    }
  };

  /**
   * INSTANT UPLOAD (EDIT MODAL): user selects file -> instantly upload -> DB update -> refresh list
   */
  const handleInstantUploadEdit = async (
    type: "image" | "banner",
    file: File
  ) => {
    if (!editing) return;
    try {
      setBusy(true);
      setUploading((p) => ({ ...p, [type === "image" ? "editImage" : "editBanner"]: true }));

      await uploadCategoryAsset(editing.slug, type, file);

      // Refresh categories + also refresh editing reference
      await loadCategories();
      // Keep modal open; reset file after upload
      if (type === "image") setEditImageFile(null);
      if (type === "banner") setEditBannerFile(null);
    } catch (e: any) {
      console.log(e);
      alert(e?.message || "Upload failed");
    } finally {
      setUploading((p) => ({
        ...p,
        editImage: false,
        editBanner: false,
      }));
      setBusy(false);
    }
  };

  /**
   * INSTANT UPLOAD (CREATE MODAL): after creating we upload,
   * but some people want pre-upload before create — NOT possible because slug doesn't exist yet.
   * So create first then upload in handleCreate().
   */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Categories</h1>
          <p className="text-sm text-gray-500">
            Create, update, and manage all product categories
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadCategories}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-semibold hover:bg-gray-50"
            type="button"
            disabled={loading || busy}
            title="Refresh"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCcw size={16} />
            )}
            Refresh
          </button>

          <button
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-60"
            type="button"
            disabled={busy}
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Add Category
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-600">Search</label>
          <div className="mt-1 flex items-center gap-2 border rounded-md px-3 py-2">
            <Search size={16} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, slug, parent..."
              className="w-full text-sm outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-white outline-none"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600">Parent</label>
          <select
            value={parent}
            onChange={(e) => setParent(e.target.value)}
            className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-white outline-none"
          >
            <option value="">All</option>
            {rootOptions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSearch("");
              setStatus("");
              setParent("");
            }}
            className="w-full px-4 py-2 rounded-md border text-sm font-semibold hover:bg-gray-50"
            type="button"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr className="text-left">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Parent</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c._id} className="border-t">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden">
                        {c.image ? (
                          <img
                            src={c.image}
                            alt={c.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon size={18} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-500">
                          Created:{" "}
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "-"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">{c.slug}</td>

                  <td className="py-3 px-4">
                    {c.parent ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                        <Layers size={14} />
                        {c.parentName || "Parent"}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">Root</span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                      Level {c.level}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-semibold">{c.priority}</td>

                  <td className="py-3 px-4">
                    <StatusBadge active={c.isActive} />
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className="px-3 py-1.5 rounded-md border text-xs font-semibold hover:bg-gray-50 disabled:opacity-60"
                        type="button"
                        disabled={busy}
                      >
                        {c.isActive ? "Disable" : "Enable"}
                      </button>

                      <button
                        onClick={() => openEditModal(c)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-semibold hover:bg-gray-50 disabled:opacity-60"
                        type="button"
                        disabled={busy}
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(c.slug)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 disabled:opacity-60"
                        type="button"
                        disabled={busy}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Loading categories...
                    </span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    No categories found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      <Modal
        open={openCreate}
        title="Add New Category"
        onClose={() => {
          setOpenCreate(false);
          resetCreateForm();
        }}
        footer={
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={createActive}
                onChange={(e) => setCreateActive(e.target.checked)}
                disabled={busy}
              />
              Active
            </label>

            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-60"
              type="button"
              disabled={busy}
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Create
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600">Name *</label>
              <input
                value={createName}
                onChange={(e) => {
                  const v = e.target.value;
                  setCreateName(v);
                  if (!createSlug.trim()) setCreateSlug(slugifyLite(v));
                }}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                disabled={busy}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Slug (preview)</label>
              <input
                value={createSlug}
                onChange={(e) => setCreateSlug(slugifyLite(e.target.value))}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                disabled
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Backend name থেকে slug auto generate করে।
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Parent (optional)</label>
              <select
                value={createParentId}
                onChange={(e) => setCreateParentId(e.target.value)}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-white outline-none"
                disabled={busy}
              >
                <option value="">Root Category</option>
                {rootOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">Priority</label>
              <input
                type="number"
                value={createPriority}
                onChange={(e) => setCreatePriority(Number(e.target.value || 1))}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                disabled={busy}
              />
            </div>

            {/* Image file */}
            <div>
              <label className="text-xs font-semibold text-gray-600">Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCreateImageFile(e.target.files?.[0] || null)}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-white outline-none"
                disabled={busy}
              />

              {createImagePreview ? (
                <div className="mt-2 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg border bg-gray-50 overflow-hidden">
                    <img src={createImagePreview} alt="preview" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs text-gray-600 truncate">{createImageFile?.name}</p>
                  {uploading.createImage ? (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                      <Loader2 size={14} className="animate-spin" /> uploading...
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* Banner file */}
            <div>
              <label className="text-xs font-semibold text-gray-600">Banner (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCreateBannerFile(e.target.files?.[0] || null)}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-white outline-none"
                disabled={busy}
              />

              {createBannerPreview ? (
                <div className="mt-2 flex items-center gap-3">
                  <div className="w-16 h-12 rounded-lg border bg-gray-50 overflow-hidden">
                    <img src={createBannerPreview} alt="preview" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs text-gray-600 truncate">{createBannerFile?.name}</p>
                  {uploading.createBanner ? (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                      <Loader2 size={14} className="animate-spin" /> uploading...
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="border rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
            <p className="font-semibold text-gray-800 mb-1">How upload works</p>
            <p>
              Create চাপলে আগে DB তে category create হবে, তারপর image/banner select থাকলে
              server PATCH দিয়ে Cloudinary upload + DB update হবে।
            </p>
          </div>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        open={openEdit}
        title="Edit Category"
        onClose={() => {
          setOpenEdit(false);
          setEditing(null);
          setEditImageFile(null);
          setEditBannerFile(null);
          setEditImagePreview("");
          setEditBannerPreview("");
        }}
        footer={
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
                disabled={busy}
              />
              Active
            </label>

            <button
              onClick={handleUpdate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-60"
              type="button"
              disabled={busy || !editing}
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Pencil size={16} />}
              Update
            </button>
          </div>
        }
      >
        {!editing ? (
          <p className="text-sm text-gray-500">No category selected.</p>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border p-3">
              <p className="text-sm font-semibold text-gray-800">Editing: {editing.name}</p>
              <p className="text-xs text-gray-500">
                slug: {editing.slug} • id: {editing._id}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">Name *</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                  disabled={busy}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Parent (optional)</label>
                <select
                  value={editParentId}
                  onChange={(e) => setEditParentId(e.target.value)}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-white outline-none"
                  disabled={busy}
                >
                  <option value="">Root Category</option>
                  {rootOptions
                    .filter((p) => p.id !== editing._id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Priority</label>
                <input
                  type="number"
                  value={editPriority}
                  onChange={(e) => setEditPriority(Number(e.target.value || 1))}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
                  disabled={busy}
                />
              </div>

              {/* Instant Image upload */}
              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Image (optional) — Upload instantly
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setEditImageFile(f);
                    // instant upload
                    handleInstantUploadEdit("image", f);
                  }}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-white outline-none"
                  disabled={busy}
                />

                <div className="mt-2 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg border bg-gray-50 overflow-hidden flex items-center justify-center">
                    {editImagePreview ? (
                      <img src={editImagePreview} alt="preview" className="w-full h-full object-cover" />
                    ) : editing.image ? (
                      <img src={editing.image} alt="current" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={18} className="text-gray-400" />
                    )}
                  </div>

                  {uploading.editImage ? (
                    <span className="inline-flex items-center gap-2 text-xs text-gray-600">
                      <UploadCloud size={14} />
                      <Loader2 size={14} className="animate-spin" /> Uploading...
                    </span>
                  ) : (
                    <span className="text-xs text-gray-600">
                      {editing.image ? "Current image" : "No image"}
                    </span>
                  )}
                </div>
              </div>

              {/* Instant Banner upload */}
              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Banner (optional) — Upload instantly
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setEditBannerFile(f);
                    handleInstantUploadEdit("banner", f);
                  }}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-white outline-none"
                  disabled={busy}
                />

                <div className="mt-2 flex items-center gap-3">
                  <div className="w-16 h-12 rounded-lg border bg-gray-50 overflow-hidden flex items-center justify-center">
                    {editBannerPreview ? (
                      <img src={editBannerPreview} alt="preview" className="w-full h-full object-cover" />
                    ) : editing.banner ? (
                      <img src={editing.banner} alt="current" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={18} className="text-gray-400" />
                    )}
                  </div>

                  {uploading.editBanner ? (
                    <span className="inline-flex items-center gap-2 text-xs text-gray-600">
                      <UploadCloud size={14} />
                      <Loader2 size={14} className="animate-spin" /> Uploading...
                    </span>
                  ) : (
                    <span className="text-xs text-gray-600">
                      {editing.banner ? "Current banner" : "No banner"}
                    </span>
                  )}
                </div>
              </div>
            </div>
 
          </div>
        )}
      </Modal>
    </div>
  );
}

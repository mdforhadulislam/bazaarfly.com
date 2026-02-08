"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Layers,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";

/* ---------------- TYPES ---------------- */
type CategoryRow = {
  _id: string;
  name: string;
  slug: string;
  level: number; // 0 root, 1 child, 2+ deep
  parent?: string | null;
  isActive: boolean;
  priority: number;
  image?: string;
  banner?: string;
  createdAt: string;
};

/* ---------------- DUMMY DATA ---------------- */
const initialCategories: CategoryRow[] = [
  {
    _id: "c1",
    name: "Fashion",
    slug: "fashion",
    level: 0,
    parent: null,
    isActive: true,
    priority: 1,
    image: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    banner: "https://res.cloudinary.com/demo/image/upload/balloons.jpg",
    createdAt: "28 Jan 2026",
  },
  {
    _id: "c2",
    name: "Men",
    slug: "men",
    level: 1,
    parent: "Fashion",
    isActive: true,
    priority: 2,
    createdAt: "28 Jan 2026",
  },
  {
    _id: "c3",
    name: "Women",
    slug: "women",
    level: 1,
    parent: "Fashion",
    isActive: true,
    priority: 3,
    createdAt: "28 Jan 2026",
  },
  {
    _id: "c4",
    name: "Electronics",
    slug: "electronics",
    level: 0,
    parent: null,
    isActive: true,
    priority: 2,
    createdAt: "29 Jan 2026",
  },
  {
    _id: "c5",
    name: "Mobile",
    slug: "mobile",
    level: 1,
    parent: "Electronics",
    isActive: false,
    priority: 1,
    createdAt: "30 Jan 2026",
  },
];

/* ---------------- HELPERS ---------------- */
function slugifyLite(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
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

/* ---------------- MODAL ---------------- */
function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <p className="font-semibold text-gray-800">{title}</p>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md border text-sm font-semibold hover:bg-gray-50"
            >
              Close
            </button>
          </div>

          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- PAGE ---------------- */
export default function AdminCategoryPage() {
  const [categories, setCategories] =
    useState<CategoryRow[]>(initialCategories);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");
  const [parent, setParent] = useState<string>("");

  // Modal states
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);

  // Create form
  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createParent, setCreateParent] = useState<string>("");
  const [createActive, setCreateActive] = useState(true);
  const [createPriority, setCreatePriority] = useState(1);
  const [createImage, setCreateImage] = useState("");
  const [createBanner, setCreateBanner] = useState("");

  // Edit form
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editParent, setEditParent] = useState<string>("");
  const [editActive, setEditActive] = useState(true);
  const [editPriority, setEditPriority] = useState(1);
  const [editImage, setEditImage] = useState("");
  const [editBanner, setEditBanner] = useState("");

  const parentOptions = useMemo(() => {
    return categories
      .filter((c) => c.level === 0)
      .map((c) => c.name);
  }, [categories]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return categories
      .filter((c) =>
        status ? (status === "active" ? c.isActive : !c.isActive) : true
      )
      .filter((c) => (parent ? c.parent === parent : true))
      .filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.slug.toLowerCase().includes(s) ||
          (c.parent || "").toLowerCase().includes(s)
      )
      .sort((a, b) => a.priority - b.priority);
  }, [categories, search, status, parent]);

  const resetCreateForm = () => {
    setCreateName("");
    setCreateSlug("");
    setCreateParent("");
    setCreateActive(true);
    setCreatePriority(1);
    setCreateImage("");
    setCreateBanner("");
  };

  const openEditModal = (row: CategoryRow) => {
    setEditing(row);
    setEditName(row.name);
    setEditSlug(row.slug);
    setEditParent(row.parent || "");
    setEditActive(row.isActive);
    setEditPriority(row.priority);
    setEditImage(row.image || "");
    setEditBanner(row.banner || "");
    setOpenEdit(true);
  };

  const handleCreate = async () => {
    const name = createName.trim();
    if (!name) return alert("Category name required");
    const slug = (createSlug || slugifyLite(name)).trim();
    if (!slug) return alert("Slug required");

    const isChild = !!createParent;
    const level = isChild ? 1 : 0;

    const newRow: CategoryRow = {
      _id: crypto.randomUUID(),
      name,
      slug,
      level,
      parent: isChild ? createParent : null,
      isActive: createActive,
      priority: Math.max(1, Number(createPriority || 1)),
      image: createImage.trim() || undefined,
      banner: createBanner.trim() || undefined,
      createdAt: new Date().toLocaleDateString(),
    };

    // TODO: POST /api/v1/admin/categories
    setCategories((p) => [newRow, ...p]);
    setOpenCreate(false);
    resetCreateForm();
  };

  const handleUpdate = async () => {
    if (!editing) return;

    const name = editName.trim();
    if (!name) return alert("Category name required");
    const slug = (editSlug || slugifyLite(name)).trim();
    if (!slug) return alert("Slug required");

    const isChild = !!editParent;
    const level = isChild ? 1 : 0;

    // TODO: PUT/PATCH /api/v1/admin/categories/:id
    setCategories((p) =>
      p.map((c) =>
        c._id === editing._id
          ? {
              ...c,
              name,
              slug,
              level,
              parent: isChild ? editParent : null,
              isActive: editActive,
              priority: Math.max(1, Number(editPriority || 1)),
              image: editImage.trim() || undefined,
              banner: editBanner.trim() || undefined,
            }
          : c
      )
    );

    setOpenEdit(false);
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    const ok = confirm("Delete this category? (demo)");
    if (!ok) return;

    // TODO: DELETE /api/v1/admin/categories/:id
    setCategories((p) => p.filter((c) => c._id !== id));
  };

  const handleToggleActive = (id: string) => {
    // TODO: PATCH /api/v1/admin/categories/:id/toggle
    setCategories((p) =>
      p.map((c) => (c._id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

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

        <button
          onClick={() => setOpenCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700"
        >
          <Plus size={16} />
          Add Category
        </button>
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
            {parentOptions.map((p) => (
              <option key={p} value={p}>
                {p}
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
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
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
                        Created: {c.createdAt}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">{c.slug}</td>
                <td className="py-3 px-4">
                  {c.parent ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                      <Layers size={14} />
                      {c.parent}
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
                      onClick={() => handleToggleActive(c._id)}
                      className="px-3 py-1.5 rounded-md border text-xs font-semibold hover:bg-gray-50"
                    >
                      {c.isActive ? "Disable" : "Enable"}
                    </button>

                    <button
                      onClick={() => openEditModal(c)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-semibold hover:bg-gray-50"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(c._id)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50"
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
                <td
                  colSpan={7}
                  className="py-10 text-center text-gray-500"
                >
                  No categories found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      <Modal
        open={openCreate}
        title="Add New Category"
        onClose={() => {
          setOpenCreate(false);
          resetCreateForm();
        }}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600">
                Name *
              </label>
              <input
                value={createName}
                onChange={(e) => {
                  setCreateName(e.target.value);
                  if (!createSlug.trim()) setCreateSlug(slugifyLite(e.target.value));
                }}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Slug *
              </label>
              <input
                value={createSlug}
                onChange={(e) => setCreateSlug(slugifyLite(e.target.value))}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Parent (optional)
              </label>
              <select
                value={createParent}
                onChange={(e) => setCreateParent(e.target.value)}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-white outline-none"
              >
                <option value="">Root Category</option>
                {parentOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-1">
                Parent দিলে child category হবে (Level 1)।
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Priority
              </label>
              <input
                type="number"
                value={createPriority}
                onChange={(e) => setCreatePriority(Number(e.target.value || 1))}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Image URL (optional)
              </label>
              <input
                value={createImage}
                onChange={(e) => setCreateImage(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Banner URL (optional)
              </label>
              <input
                value={createBanner}
                onChange={(e) => setCreateBanner(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={createActive}
                onChange={(e) => setCreateActive(e.target.checked)}
              />
              Active
            </label>

            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700"
            >
              <Plus size={16} />
              Create
            </button>
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
        }}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600">
                Name *
              </label>
              <input
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value);
                }}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Slug *
              </label>
              <input
                value={editSlug}
                onChange={(e) => setEditSlug(slugifyLite(e.target.value))}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Parent (optional)
              </label>
              <select
                value={editParent}
                onChange={(e) => setEditParent(e.target.value)}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-white outline-none"
              >
                <option value="">Root Category</option>
                {parentOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Priority
              </label>
              <input
                type="number"
                value={editPriority}
                onChange={(e) => setEditPriority(Number(e.target.value || 1))}
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Image URL (optional)
              </label>
              <input
                value={editImage}
                onChange={(e) => setEditImage(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600">
                Banner URL (optional)
              </label>
              <input
                value={editBanner}
                onChange={(e) => setEditBanner(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
              />
              Active
            </label>

            <button
              onClick={handleUpdate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700"
            >
              <Pencil size={16} />
              Update
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

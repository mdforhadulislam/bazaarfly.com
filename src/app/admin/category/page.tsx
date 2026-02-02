"use client";

import { Plus, Pencil, FolderTree } from "lucide-react";
import Link from "next/link";

type Category = {
  _id: string;
  name: string;
  slug: string;
  level: number;
  priority: number;
  isActive: boolean;
  parent?: string | null;
};

const categories: Category[] = [
  {
    _id: "1",
    name: "Electronics",
    slug: "electronics",
    level: 1,
    priority: 1,
    isActive: true,
  },
  {
    _id: "2",
    name: "Mobile Phones",
    slug: "mobile-phones",
    level: 2,
    priority: 2,
    isActive: true,
    parent: "Electronics",
  },
  {
    _id: "3",
    name: "Men Fashion",
    slug: "men-fashion",
    level: 1,
    priority: 3,
    isActive: false,
  },
];

export default function AdminCategoryPage() {
  return (
    <section className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderTree className="text-orange-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            Category Management
          </h1>
        </div>

        <Link
          href="/admin/category/create"
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          <Plus size={16} />
          Add Category
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-orange-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Slug</th>
              <th className="px-4 py-3 text-center">Level</th>
              <th className="px-4 py-3 text-center">Priority</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((cat) => (
              <tr
                key={cat._id}
                className="border-t hover:bg-orange-50/40 transition"
              >
                <td className="px-4 py-3 font-medium text-gray-800">
                  {cat.name}
                  {cat.parent && (
                    <div className="text-xs text-gray-500">
                      Parent: {cat.parent}
                    </div>
                  )}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {cat.slug}
                </td>

                <td className="px-4 py-3 text-center">
                  {cat.level}
                </td>

                <td className="px-4 py-3 text-center">
                  {cat.priority}
                </td>

                <td className="px-4 py-3 text-center">
                  {cat.isActive ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 font-semibold">
                      Inactive
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/category/edit/${cat._id}`}
                    className="inline-flex items-center gap-1 text-orange-600 hover:underline font-medium"
                  >
                    <Pencil size={14} />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* EMPTY STATE */}
        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No categories found
          </div>
        )}
      </div>
    </section>
  );
}

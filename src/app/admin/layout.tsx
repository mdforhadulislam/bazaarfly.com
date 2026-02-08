"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  CreditCard,
  Handshake,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

function prettyTitle(pathname: string) {
  // "/admin/products/create" -> "Products / Create"
  const parts = pathname.split("/").filter(Boolean);
  const adminIndex = parts.indexOf("admin");
  const rest = adminIndex >= 0 ? parts.slice(adminIndex + 1) : parts;

  if (rest.length === 0) return "Dashboard";

  return rest
    .map((p) => {
      if (p.length > 20 && /^[a-f0-9]{16,}$/i.test(p)) return "Details";
      return p
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (m) => m.toUpperCase());
    })
    .join(" / ");
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/admin";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { signout, user } = useAuth();

  const menus: MenuItem[] = useMemo(
    () => [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },

      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },

      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Category", href: "/admin/category", icon: Layers },
      { label: "Tags", href: "/admin/tags", icon: Tags },

      { label: "Affiliates", href: "/admin/affiliates", icon: Handshake },

      { label: "Banners", href: "/admin/banners", icon: ImageIcon },
      { label: "Popups", href: "/admin/popups", icon: LayoutGrid },

      { label: "Notifications", href: "/admin/notifications", icon: Bell },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },

      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
    []
  );

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      
    await signout();

      router.push("/auth/signin");
    } catch (e) {
      alert("Logout failed");
      console.log(e);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Top bar (mobile-first) */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
              onClick={() => setOpen(true)}
              aria-label="Open sidebar"
              type="button"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                B
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-gray-800">Bazaarfly</p>
                <p className="text-[11px] text-gray-500">Admin Panel</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-md hover:bg-gray-100 text-gray-700"
              type="button"
              title="Notifications"
            >
              <Bell size={18} />
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l">
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-semibold">
                AD
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-gray-800">Admin</p>
                <p className="text-[11px] text-gray-500">admin@bazaarfly.com</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {open ? (
        <div className="fixed inset-0 z-90 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-xl border-r">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                  B
                </div>
                <div>
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-[11px] text-gray-500">{user?.email}</p>
                </div>
              </div>
              <button
                className="p-2 rounded-md hover:bg-gray-100"
                onClick={() => setOpen(false)}
                aria-label="Close sidebar"
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="p-3">
              <ul className="flex flex-col gap-1 max-h-[calc(100vh-150px)] overflow-y-auto pr-1">
                {menus.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                          active
                            ? "bg-orange-50 text-orange-700 font-semibold"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {active ? (
                          <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-orange-600" />
                        ) : null}
                        <Icon size={18} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}

                <li className="pt-4 mt-4 border-t">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50"
                    type="button"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      ) : null}

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block md:col-span-3 lg:col-span-3">
            <div className="bg-white rounded-2xl border shadow-sm p-4 sticky top-20 h-[calc(100vh-120px)] overflow-hidden">
              {/* Admin Block */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-semibold">
                  AD
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-gray-800">Admin Panel</p>
                  <p className="text-[11px] text-gray-500">admin@bazaarfly.com</p>
                </div>
              </div>

              {/* Menu */}
              <nav className="mt-5">
                <ul className="flex flex-col gap-1 h-[calc(100vh-230px)] overflow-y-auto pr-1">
                  {menus.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                            active
                              ? "bg-orange-50 text-orange-700 font-semibold"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {active ? (
                            <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-orange-600" />
                          ) : null}
                          <Icon size={18} />
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}

                  {/* Logout */}
                  <li className="pt-4 mt-4 border-t">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50"
                      type="button"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="md:col-span-9 lg:col-span-9">
            <div className="bg-white rounded-2xl border shadow-sm p-6 min-h-[65vh]">
              {/* Page Header */}
              <div className="flex items-start sm:items-center justify-between gap-4 pb-4 border-b mb-6">
                <div>
                  <p className="text-sm text-gray-500">Bazaarfly Admin</p>
                  <h1 className="text-lg font-semibold text-gray-800">
                    {prettyTitle(pathname)}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 rounded-md text-sm border hover:bg-gray-50"
                    type="button"
                  >
                    Quick Action
                  </button>
                </div>
              </div>

              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

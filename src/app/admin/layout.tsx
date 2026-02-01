"use client";

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
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type MenuItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/admin";
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
    // TODO: replace with real API call
    // await fetch("/api/v1/auth/signout", { method: "POST" });
    alert("Logout placeholder");
    router.push("/auth/signin"); // change to your login route
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="bg-white rounded-xl border shadow-sm p-4 md:sticky md:top-6 h-fit">
              {/* Admin Block */}
              <div className="flex items-center justify-between md:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold">
                    AD
                  </div>

                  <div>
                    <p className="text-sm font-semibold">Admin Panel</p>
                    <p className="text-xs text-gray-500">admin@bazaarfly.com</p>
                  </div>
                </div>

                {/* Mobile toggle */}
                <button
                  className="md:hidden p-2 rounded-md hover:bg-gray-100"
                  onClick={() => setOpen(!open)}
                  aria-label="Toggle menu"
                >
                  <Menu size={20} />
                </button>
              </div>

              {/* Menu */}
              <nav className={`${open ? "block" : "hidden"} md:block mt-6`}>
                <ul className="flex flex-col gap-1 max-h-[70vh] overflow-y-auto pr-1">
                  {menus.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                            active
                              ? "bg-orange-100 text-orange-600 font-semibold"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
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
          <main className="md:col-span-3">
            <div className="bg-white rounded-xl border shadow-sm p-6 min-h-[60vh]">
              {/* Optional: simple page header */}
              <div className="flex items-center justify-between pb-4 border-b mb-6">
                <div>
                  <p className="text-sm text-gray-500">Bazaarfly Admin</p>
                  <h1 className="text-lg font-semibold text-gray-800">
                    {pathname.replace("/admin", "Admin").replaceAll("/", " / ")}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-3 py-2 rounded-md text-sm border hover:bg-gray-50">
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

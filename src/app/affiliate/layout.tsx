"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Link2,
  ShoppingBag,
  Wallet,
  Bell,
  User,
  Settings,
  CreditCard,
  Menu,
  LogOut,
} from "lucide-react";
import { useState } from "react";

const menus = [
  { label: "Dashboard", href: "/affiliate", icon: LayoutDashboard },
  { label: "Analytics", href: "/affiliate/analytics", icon: BarChart3 },
  { label: "Links", href: "/affiliate/links", icon: Link2 },
  { label: "Orders", href: "/affiliate/orders", icon: ShoppingBag },
  { label: "Commissions", href: "/affiliate/commissions", icon: CreditCard },
  { label: "Wallet", href: "/affiliate/wallet", icon: Wallet },
  { label: "Withdraw", href: "/affiliate/withdraw", icon: Wallet },
  { label: "Notifications", href: "/affiliate/notifications", icon: Bell },
  { label: "Profile", href: "/affiliate/profile", icon: User },
  { label: "Settings", href: "/affiliate/settings", icon: Settings },
];

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/affiliate";
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="bg-white rounded-xl border shadow-sm p-4 md:sticky md:top-6 h-fit">

              {/* User block */}
              <div className="flex items-center justify-between md:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold">
                    BF
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Affiliate Panel
                    </p>
                    <p className="text-xs text-gray-500">
                      user@bazaarfly.com
                    </p>
                  </div>
                </div>

                <button
                  className="md:hidden p-2 rounded-md hover:bg-gray-100"
                  onClick={() => setOpen(!open)}
                >
                  <Menu size={20} />
                </button>
              </div>

              {/* Menu */}
              <nav className={`${open ? "block" : "hidden"} md:block mt-6`}>
                <ul className="flex flex-col gap-1 max-h-[70vh] overflow-y-auto pr-1">

                  {menus.map((item) => {
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");

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
                      onClick={() => alert("Logout placeholder")}
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
              {children}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}

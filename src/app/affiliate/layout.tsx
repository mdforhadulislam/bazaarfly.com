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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <aside className="md:col-span-1">
              <div className="bg-white rounded-xl border shadow-sm p-4">
                {/* Mobile toggle */}
                <div className="flex items-center justify-between md:block">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold">
                      BF
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Hello, Seller</p>
                      <p className="text-xs text-gray-500">forhadul@demo.com</p>
                    </div>
                  </div>
  
                  <button
                    className="md:hidden p-2 rounded-md hover:bg-gray-100"
                    onClick={() => setOpen(!open)}
                    aria-label="Toggle menu"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
  
                {/* Menu */}
                <nav className={`${open ? "block" : "hidden"} md:block mt-5`}>
                  <ul className="flex flex-col gap-1">
                    {menu.map((item) => {
                      const active =
                        pathname === item.href ||
                        (item.href !== "/account" && pathname?.startsWith(item.href));
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                              active
                                ? "bg-orange-50 text-orange-600 font-medium"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <span className="text-gray-400">
                              <Icon name={item.icon} />
                            </span>
                            <span>{item.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                    <li>
                      <button
                        onClick={() => alert("Logout placeholder")}
                        className="w-full text-left mt-2 flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50"
                      >
                        <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none">
                          <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Logout
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </aside>
  
            {/* Content */}
            <main className="md:col-span-3">
              <div className="bg-white rounded-xl border shadow-sm p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
}

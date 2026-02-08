"use client";

import Link from "next/link";
import { ReactNode, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // ✅ তোমার AuthContext path যদি আলাদা হয়, এখানে change করো

const menu = [
  { name: "Dashboard", href: "/account", icon: "home" },
  { name: "My Orders", href: "/account/orders", icon: "package" },
  { name: "Payments", href: "/account/payments", icon: "credit-card" },
  { name: "Profile", href: "/account/profile", icon: "user" },
  { name: "Address Book", href: "/account/address", icon: "map-pin" },
  { name: "Notifications", href: "/account/notifications", icon: "bell" },
];

function Icon({ name }: { name: string }) {
  switch (name) {
    case "home":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M3 11.5L12 4l9 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
          <path d="M5 12v7a1 1 0 0 0 1 1h3v-5h6v5h3a1 1 0 0 0 1-1v-7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
        </svg>
      );
    case "package":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M21 16V8a1 1 0 0 0-.553-.894L13 3.382a1 1 0 0 0-.894 0L3.553 7.106A1 1 0 0 0 3 8v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 9.5l5 3 5-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "credit-card":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M2 10h20" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
      );
    case "user":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "map-pin":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19 11.5c0 6-7 9-7 9s-7-3-7-9a7 7 0 1 1 14 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case "bell":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18.6 14.2C18.2 13.2 18 12.1 18 11V8a6 6 0 1 0-12 0v3c0 1.1-.2 2.2-.6 3.2a2.032 2.032 0 0 1-.995 1.395L4 17h11z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    default:
      return null;
  }
}

export default function AccountLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/account";
  const [open, setOpen] = useState(false);

  const { user, logout, loading } = useAuth(); // ✅ AuthContext

  const userName = user?.name || "User";
  const userEmail = user?.email || "—";

  const initials = useMemo(() => {
    const parts = String(userName).trim().split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] || "B";
    const b = parts[1]?.[0] || "F";
    return (a + b).toUpperCase();
  }, [userName]);

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
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {loading ? "Loading..." : `Hello, ${userName}`}
                    </p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
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
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                            active
                              ? "bg-orange-50 text-orange-600 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span className={`${active ? "text-orange-600" : "text-gray-400"}`}>
                            <Icon name={item.icon} />
                          </span>
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}

                  <li>
                    <button
                      onClick={logout} // ✅ AuthContext logout
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

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export default function NavBar() {
  const router = useRouter();
  const { user, isAuthenticated, signout, actionLoading } = useAuth();
  const { totalQty } = useCart();

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const categories = useMemo(
    () => [
      { name: "For You", sub: ["Trending", "Best Deals", "New Arrivals"] },
      {
        name: "Men",
        sub: ["T-Shirts", "Shirts", "Pants", "Footwear", "Accessories"],
      },
      { name: "Women", sub: ["Dresses", "Tops", "Saree", "Bags", "Footwear"] },
      {
        name: "Kids",
        sub: ["Boys Clothing", "Girls Clothing", "Toys", "School Bags"],
      },
      { name: "Baby", sub: ["Clothing Sets", "Shoes", "Care Products"] },
      {
        name: "Health & Beauty",
        sub: ["Skincare", "Makeup", "Wellness", "Hair Care"],
      },
    ],
    []
  );

  const onSearch = () => {
    const query = q.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const onLogout = async () => {
    setOpen(false);
    await signout();
    router.refresh();
    router.push("/auth/signin");
  };

  return (
    <>
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex container justify-between items-center gap-4 px-4 py-3">
          {/* LEFT */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(true)}
              className="hover:bg-orange-50"
            >
              <Menu />
            </Button>

            <Link
              href="/"
              className="text-2xl font-extrabold tracking-tight text-orange-500"
            >
              BazaarFly
            </Link>
          </div>

          {/* SEARCH */}
          <div className="relative flex-1 max-w-[620px]">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
              onClick={onSearch}
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder="Search fashion, gadgets, accessories..."
              className="pl-11 rounded-full bg-muted focus-visible:ring-orange-500"
            />
          </div>

          {/* ICONS */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild className="gap-2 relative">
              <Link href="/cart">
                <ShoppingCart size={18} />
                {totalQty > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[11px] flex items-center justify-center">
                    {totalQty}
                  </span>
                )}
              </Link>
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="gap-2">
                  <Link href="/profile">
                    <User size={18} />
                    <span className="hidden lg:inline">
                      {user?.name?.split(" ")[0] ?? "Profile"}
                    </span>
                  </Link>
                </Button>

                <Button
                  variant="default"
                  onClick={onLogout}
                  disabled={actionLoading}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {actionLoading ? "..." : "Logout"}
                </Button>
              </div>
            ) : (
              <Button
                variant="default"
                asChild
                className="bg-orange-500 hover:bg-orange-600 gap-2"
              >
                <Link href="/auth/signin">
                  <User size={18} /> Login
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <div
        className={`fixed inset-0 z-100 transition ${
          open ? "visible" : "invisible"
        }`}
      >
        {/* BACKDROP */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* PANEL */}
        <aside
          className={`absolute left-0 top-0 h-full w-[320px] bg-white shadow-xl transition-transform duration-300 flex flex-col ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="text-lg font-bold text-orange-500">
              Browse Categories
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X />
            </Button>
          </div>

          {/* CATEGORY LIST (scrollable + bottom safe space for MobileBottomBar) */}
          <div className="flex-1 overflow-y-auto p-2 pb-28 space-y-1">
            {categories.map((cat) => {
              const isOpen = active === cat.name;

              return (
                <div key={cat.name} className="rounded-lg border bg-white">
                  <button
                    onClick={() => setActive(isOpen ? null : cat.name)}
                    className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-orange-50 transition"
                  >
                    <span>{cat.name}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        isOpen ? "rotate-180 text-orange-500" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      {cat.sub.map((sub) => (
                        <Link
                          key={sub}
                          href={`/category/${cat.name
                            .toLowerCase()}/${sub
                            .toLowerCase()
                            .replaceAll(" ", "-")}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2 px-6 py-2 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition"
                        >
                          <ChevronRight size={14} className="text-gray-400" />
                          {sub}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* AUTH (Mobile quick actions) */}
          <div className="px-4 pt-3 pb-2 py-2 border-y">
            {isAuthenticated ? (
              <div className="flex items-center justify-between gap-2">
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="text-sm font-semibold"
                >
                  {user?.name ?? "Profile"}
                </Link>
                <Button
                  onClick={onLogout}
                  disabled={actionLoading}
                  className="bg-orange-500 hover:bg-orange-600"
                  size="sm"
                >
                  {actionLoading ? "..." : "Logout"}
                </Button>
              </div>
            ) : (
              <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
                <Link href="/auth/signin" onClick={() => setOpen(false)}>
                  Login
                </Link>
              </Button>
            )}
          </div>

        </aside>
      </div>
    </>
  );
}

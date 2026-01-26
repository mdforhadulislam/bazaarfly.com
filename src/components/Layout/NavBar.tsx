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
import { useState } from "react";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const categories = [
    {
      name: "For You",
      sub: ["Trending", "Best Deals", "New Arrivals"],
    },
    {
      name: "Men",
      sub: ["T-Shirts", "Shirts", "Pants", "Footwear", "Accessories"],
    },
    {
      name: "Women",
      sub: ["Dresses", "Tops", "Saree", "Bags", "Footwear"],
    },
    {
      name: "Kids",
      sub: ["Boys Clothing", "Girls Clothing", "Toys", "School Bags"],
    },
    {
      name: "Baby",
      sub: ["Clothing Sets", "Shoes", "Care Products"],
    },
    {
      name: "Health & Beauty",
      sub: ["Skincare", "Makeup", "Wellness", "Hair Care"],
    },
  ];

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
          <div className="relative flex-1 max-w-[620px] ">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              placeholder="Search fashion, gadgets, accessories..."
              className="pl-11 rounded-full bg-muted focus-visible:ring-orange-500"
            />
          </div>

          {/* ICONS */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild className="gap-2">
              <Link href="/cart">
                <ShoppingCart size={18} />
              </Link>
            </Button>

            <Button
              variant="default"
              asChild
              className="bg-orange-500 hover:bg-orange-600 gap-2"
            >
              <Link href="/profile">
                <User size={18} />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <div
        className={`fixed inset-0 z-50 transition ${
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
          className={`absolute left-0 top-0 h-full w-[320px] bg-white shadow-xl transition-transform duration-300 ${
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

          {/* CATEGORY LIST */}
          <div className="p-2 space-y-1 overflow-y-auto">
            {categories.map((cat) => {
              const isOpen = active === cat.name;

              return (
                <div key={cat.name} className="rounded-lg border bg-white">
                  {/* MAIN CATEGORY */}
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

                  {/* SUBCATEGORY */}
                  <div
                    className={`grid transition-all duration-300 ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      {cat.sub.map((sub) => (
                        <Link
                          key={sub}
                          href={`/category/${cat.name.toLowerCase()}/${sub
                            .toLowerCase()
                            .replace(" ", "-")}`}
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
        </aside>
      </div>
    </>
  );
}

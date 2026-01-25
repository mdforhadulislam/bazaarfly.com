"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/components/ui/button";
import { Input } from "@/components/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/components/ui/dropdown-menu";

const categories = [
  { name: "Electronics", sub: ["Mobile", "Laptop", "Accessories"] },
  { name: "Fashion", sub: ["Men", "Women", "Kids"] },
  { name: "Home & Living", sub: ["Furniture", "Kitchen", "Decor"] },
];

export default function NavBar() {
  const [query, setQuery] = useState("");
  const loggedIn = true;
  const affiliate = true;

  return (
    <header className="sticky top-0 z-50 bg-white border-b">

      {/* TOP BAR */}
      <div className="mx-auto max-w-7xl flex items-center gap-4 px-4 py-3">

        {/* MOBILE MENU */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu size={22} />
        </Button>

        {/* LOGO */}
        <Link href="/" className="text-2xl font-black text-orange-500 tracking-tight">
          BazaarFly
        </Link>

        {/* SEARCH */}
        <div className="relative flex-1 max-w-[640px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands, categories..."
            className="pl-10 rounded-full bg-gray-50 focus:ring-orange-500"
          />
        </div>

        {/* RIGHT ACTIONS */}
        <div className="hidden md:flex items-center gap-6">

          <Link href="/orders">
            <Button variant="ghost">Orders</Button>
          </Link>

          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart size={22} />
            </Button>
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] px-1 rounded-full">
              2
            </span>
          </Link>

          {!loggedIn ? (
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1">
                  <User size={20} />
                  <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/account">Account Info</Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/orders">Orders</Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/payments">Payments</Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/address">Address</Link>
                </DropdownMenuItem>

                {affiliate && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="font-semibold text-orange-600">
                      Affiliate Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem className="text-red-500">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* CATEGORY BAR */}
      <div className="hidden md:block border-t bg-white">
        <div className="mx-auto max-w-7xl flex gap-8 px-4 py-2 text-sm font-semibold">

          {categories.map((cat, i) => (
            <DropdownMenu key={i}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-1">
                  {cat.name}
                  <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56">
                {cat.sub.map((sub, j) => (
                  <DropdownMenuItem key={j} asChild>
                    <Link href={`/category/${sub.toLowerCase()}`}>
                      {sub}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}

        </div>
      </div>
    </header>
  );
}

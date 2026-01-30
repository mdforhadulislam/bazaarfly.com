"use client";

import { motion } from "framer-motion";
import { ChevronDown, Facebook, Instagram, Youtube } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function FooterBar() {
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpen(open === key ? null : key);
  };

  return (
    <footer className="mt-5 mb-20 sm:mb-0 bg-white border-t">
      <div className="container mx-auto px-4 py-14 grid gap-8 md:grid-cols-4 text-gray-700">
        {/* BRAND */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="md:col-span-2 space-y-4"
        >
          <h2 className="text-3xl font-extrabold text-orange-500">BazaarFly</h2>

          <p className="text-sm text-gray-600">
            BazaarFly is Bangladesh’s modern online marketplace — fashion,
            lifestyle, electronics & essentials. Smart shopping made easy.
          </p>

          {/* SOCIAL LINKS */}
          <div className="flex gap-3 pt-2">
            {[Facebook, Instagram, Youtube].map((Icon, i) => (
              <motion.a
                key={i}
                whileHover={{ scale: 1.1, y: -2 }}
                className="p-2 rounded-full border hover:bg-orange-50 transition"
              >
                <Icon
                  size={18}
                  className="text-gray-600 hover:text-orange-500"
                />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* POLICIES */}
        <FooterSection
          title="BazaarFly Policies"
          id="policies"
          open={open}
          toggle={toggle}
          items={[
            "Return & Refund Policy",
            "Exchange Policy",
            "Shipping & Delivery Policy",
            "Cancellation Policy",
            "Privacy Policy",
            "Terms & Conditions",
          ]}
        />

        {/* POLICIES */}
        <FooterSection
          title="Contact Us"
          id="contact"
          open={open}
          toggle={toggle}
          items={[
            `Phone : +880 1XXX-XXXXXX`,
            `Email : support@bazaarfly.com`,
            `Map : Dhaka, Bangladesh`,
          ]}
        />
        
      </div>

      {/* BOTTOM BAR */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="border-t bg-gray-50"
      >
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 gap-3">
          <p className="hover:text-orange-500 transition">
            © {new Date().getFullYear()} BazaarFly Limited. All rights reserved.
          </p>

          {/* SSL / PAYMENT */}
          <div className="flex gap-3">
            {["SSL Secure", "VISA", "MasterCard", "bKash"].map((item) => (
              <motion.span
                key={item}
                whileHover={{ scale: 1.05, y: -2 }}
                className="px-3 py-1 border rounded text-xs bg-white shadow cursor-pointer"
              >
                {item}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
    </footer>
  );
}

/* MOBILE ACCORDION / DESKTOP OPEN */
function FooterSection({
  title,
  items,
  id,
  open,
  toggle,
}: {
  title: string;
  items: string[];
  id: string;
  open: string | null;
  toggle: (id: string) => void;
}) {
  const isOpen = open === id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border rounded-lg p-4 md:border-0"
    >
      {/* HEADER */}
      <button
        onClick={() => toggle(id)}
        className="flex w-full items-center justify-between font-semibold text-gray-900 md:pointer-events-none"
      >
        {title}

        {/* MOBILE ONLY ARROW */}
        <ChevronDown
          size={16}
          className={`md:hidden transition-transform ${
            isOpen ? "rotate-180 text-orange-500" : ""
          }`}
        />
      </button>

      {/* LIST */}
      <motion.div
        initial={false}
        animate={{
          height:
            isOpen ||
            (typeof window !== "undefined" && window.innerWidth >= 768)
              ? "auto"
              : 0,
          opacity:
            isOpen ||
            (typeof window !== "undefined" && window.innerWidth >= 768)
              ? 1
              : 0,
        }}
        className="overflow-hidden md:!h-auto md:!opacity-100"
      >
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          {items.map((item) => (
            <li key={item}>
              <Link href="#" className="hover:text-orange-500 transition">
                {item}
              </Link>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}

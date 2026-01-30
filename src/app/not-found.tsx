"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, ArrowLeft, Store } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative min-h-auto flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100 px-6 py-6">

      {/* FLOATING PREMIUM BACKGROUND ORBS */}
      <motion.div
        animate={{ y: [0, -60, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-orange-300 rounded-full blur-3xl opacity-30"
      />
      <motion.div
        animate={{ y: [0, 60, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute bottom-0 -right-40 w-[520px] h-[520px] bg-orange-200 rounded-full blur-3xl opacity-40"
      />

      {/* GLASS PREMIUM CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 bg-white/70 backdrop-blur-xl border border-white shadow-2xl rounded-[32px] p-8 max-w-3xl text-center"
      >

        {/* ANIMATED ICON */}
        <motion.div
          animate={{ rotate: [0, 6, -6, 0], y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 shadow-xl"
        >
          <ShoppingCart size={46} />
        </motion.div>

        {/* BIG 404 */}
        <h1 className="mt-5 text-[120px] md:text-[170px] font-black text-orange-600 drop-shadow-xl leading-none tracking-tight">
          404
        </h1>

        {/* TITLE */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">
          Looks Like You’re Lost
        </h2>

        {/* DESCRIPTION */}
        <p className="text-gray-600 mt-3 max-w-xl mx-auto leading-relaxed">
          The page you’re searching for doesn’t exist anymore.  
          Let’s bring you back to discover amazing deals on BazarFly.
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex justify-center gap-4 mt-6 flex-wrap">

          <Link
            href="/"
            className="flex items-center gap-2 px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold shadow-xl transition hover:scale-105"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>


        </div>

        {/* BRAND FOOTER */}
        <p className="text-xs text-gray-400 mt-8 tracking-wide">
          BazarFly — Premium Shopping Experience
        </p>
      </motion.div>
    </section>
  );
}

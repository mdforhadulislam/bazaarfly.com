"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <section className="relative min-h-auto flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100 px-6 py-6">

      {/* FLOATING BACKGROUND ORBS */}
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
        className="relative z-10 bg-white/70 backdrop-blur-xl border border-white shadow-2xl rounded-[32px] p-10 max-w-3xl text-center"
      >

        {/* ANIMATED ERROR ICON */}
        <motion.div
          animate={{ rotate: [0, 6, -6, 0], y: [0, -8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 shadow-xl"
        >
          <AlertTriangle size={48} />
        </motion.div>

        {/* ERROR TITLE */}
        <h1 className="mt-6 text-[90px] md:text-[120px] font-black text-orange-600 drop-shadow-xl leading-none tracking-tight">
          Error
        </h1>

        {/* MESSAGE */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">
          Something Went Wrong
        </h2>

        <p className="text-gray-600 mt-3 max-w-xl mx-auto leading-relaxed">
          A temporary issue occurred while loading this page.  
          Please try again — or return to BazarFly home and continue shopping.
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex justify-center gap-4 mt-8 flex-wrap">

          <button
            onClick={() => reset()}
            className="flex items-center gap-2 px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold shadow-xl transition hover:scale-105 hover:shadow-2xl"
          >
            <RefreshCcw size={18} />
            Try Again
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 px-8 py-3 bg-white border border-gray-300 hover:border-gray-400 rounded-xl font-semibold transition hover:scale-105 hover:shadow-lg"
          >
            <Home size={18} />
            Back to Home
          </Link>

        </div>

        {/* DEV DEBUG (only visible in dev mode) */}
        {process.env.NODE_ENV === "development" && (
          <p className="mt-6 text-xs text-gray-400 break-all">
            Debug Info: {error.message}
          </p>
        )}

        {/* BRAND FOOTER */}
        <p className="text-xs text-gray-400 mt-10 tracking-wide">
          BazarFly — Premium Shopping Experience
        </p>

      </motion.div>
    </section>
  );
}

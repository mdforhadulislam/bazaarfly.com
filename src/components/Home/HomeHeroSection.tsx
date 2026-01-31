"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const HomeHeroSection = () => {
  return (
    <section className="bg-white py-12 px-4 relative overflow-hidden">

      {/* PREMIUM BACKGROUND GLOW */}
      <div className="absolute -top-20 -right-10 h-[260px] w-[260px] rounded-full bg-orange-200 blur-[120px] opacity-40" />
      <div className="absolute bottom-0 -left-20 h-[300px] w-[300px] rounded-full bg-amber-200 blur-[130px] opacity-45" />
      <div className="absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-100 blur-[180px] opacity-30" />

      <div className="max-w-5xl mx-auto text-center relative z-10">

        {/* PREMIUM BADGE */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-5 py-1 rounded-full text-sm font-semibold border border-orange-100 shadow-sm"
        >
          BazaarFly — Smart Shopping Starts Here
        </motion.div>

        {/* MAIN TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-4 text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight"
        >
          Premium Finds. <br />
          <span className="text-orange-500">Exclusive Deals.</span>
        </motion.h1>

        {/* SUBTEXT */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed"
        >
          Shop smart. Save more. All in one place — only on BazaarFly.
        </motion.p>

        {/* CTA BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-6 flex justify-center gap-4 flex-wrap"
        >
          <Link href="/shop">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
              Shop Now
            </button>
          </Link>

          <Link href="/categories">
            <button className="bg-white/80 backdrop-blur border border-gray-300 hover:border-orange-500 hover:text-orange-600 px-8 py-2 rounded-xl font-semibold transition-all hover:-translate-y-0.5">
              Browse Categories
            </button>
          </Link>
        </motion.div>

       

      </div>

    </section>
  );
};

export default HomeHeroSection;

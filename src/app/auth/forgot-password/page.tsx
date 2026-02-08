"use client";

import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  return (
    <section className="h-auto overflow-hidden relative py-8 bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-3">

      {/* BACKGROUND GLOW */}
      <motion.div
        animate={{ y: [0, -40, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-orange-300 blur-3xl opacity-25 rounded-full"
      />
      <motion.div
        animate={{ y: [0, 40, 0] }}
        transition={{ duration: 14, repeat: Infinity }}
        className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-orange-200 blur-3xl opacity-30 rounded-full"
      />

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-white/90 backdrop-blur-xl border shadow-xl rounded-3xl p-8 w-full max-w-md text-center"
      >

        {/* ICON */}
        <div className="flex justify-center mb-5">
          <div className="bg-orange-100 text-orange-600 p-4 rounded-full">
            <Mail size={34} />
          </div>
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Forgot Password?
        </h1>

        {/* DESCRIPTION */}
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Enter your email address and we’ll send you a password reset link for{" "}
          <span className="text-orange-600 font-semibold">BazaarFly</span>.
        </p>

        {/* FORM */}
        <form className="mt-6 space-y-4">

          <div className="text-left space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <div className="flex items-center border rounded-xl px-3 focus-within:ring-2 focus-within:ring-orange-500">
              <Mail size={18} className="text-gray-400" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="w-full px-3 py-3 outline-none text-sm bg-transparent"
              />
            </div>
          </div>

          {/* SUBMIT */}
          <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition">
            Send Reset Link
          </button>

        </form>

        {/* FOOTER */}
        <p className="mt-6 text-sm text-gray-600">
          Remember your password?{" "}
          <Link href="/auth/login" className="text-orange-600 font-semibold hover:underline inline-flex items-center gap-1">
            Login <ArrowRight size={14} />
          </Link>
        </p>

      </motion.div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            <CheckCircle size={34} />
          </div>
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Reset Password
        </h1>

        {/* DESCRIPTION */}
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Create a new secure password for your{" "}
          <span className="text-orange-600 font-semibold">BazaarFly</span> account.
        </p>

        {/* FORM */}
        <form className="mt-6 space-y-4">

          {/* NEW PASSWORD */}
          <div className="text-left space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              New Password
            </label>
            <div className="flex items-center border rounded-xl px-3 focus-within:ring-2 focus-within:ring-orange-500">
              <Lock size={18} className="text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter new password"
                className="w-full px-3 py-3 outline-none text-sm bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-orange-600 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="text-left space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Confirm Password
            </label>
            <div className="flex items-center border rounded-xl px-3 focus-within:ring-2 focus-within:ring-orange-500">
              <Lock size={18} className="text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Confirm password"
                className="w-full px-3 py-3 outline-none text-sm bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-gray-400 hover:text-orange-600 transition"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* SUBMIT */}
          <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition">
            Update Password
          </button>

        </form>

        {/* FOOTER */}
        <p className="mt-6 text-sm text-gray-600">
          Back to{" "}
          <Link href="/auth/login" className="text-orange-600 font-semibold hover:underline">
            Login
          </Link>
        </p>

      </motion.div>
    </section>
  );
}

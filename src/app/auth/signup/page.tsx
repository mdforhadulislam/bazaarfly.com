"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, Phone, UserPlus, Chrome } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Connect API / NextAuth
    setTimeout(() => {
      setLoading(false);
      alert("Signup Submitted");
    }, 1500);
  };

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
        className="relative z-10 bg-white/90 backdrop-blur-xl border shadow-xl rounded-3xl p-8 w-full max-w-md"
      >

        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Create an Account
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Join <span className="text-orange-600 font-semibold">BazaarFly</span> and start shopping
          </p>
        </div>

        {/* FORM */}
        <form className="space-y-5" onSubmit={handleSubmit}>

          {/* FULL NAME */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Full Name
            </label>
            <div className="flex items-center border rounded-xl px-3 focus-within:ring-2 focus-within:ring-orange-500">
              <User size={18} className="text-gray-400" />
              <input
                type="text"
                required
                placeholder="Your full name"
                className="w-full px-3 py-3 outline-none text-sm bg-transparent"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="space-y-1">
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

          {/* PHONE */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Phone Number
            </label>
            <div className="flex items-center border rounded-xl px-3 focus-within:ring-2 focus-within:ring-orange-500">
              <Phone size={18} className="text-gray-400" />
              <input
                type="tel"
                required
                placeholder="+880 1XXXXXXXXX"
                className="w-full px-3 py-3 outline-none text-sm bg-transparent"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="flex items-center border rounded-xl px-3 focus-within:ring-2 focus-within:ring-orange-500">
              <Lock size={18} className="text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Create password"
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

          {/* SIGN UP BUTTON */}
          <button
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition disabled:opacity-60"
          >
            <UserPlus size={18} />
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex-1 border-t" />
            OR CONTINUE WITH
            <span className="flex-1 border-t" />
          </div>

          {/* GOOGLE LOGIN */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 border rounded-xl py-3 font-semibold hover:bg-gray-50 transition"
          >
            <Chrome size={18} />
            Continue with Google
          </button>

          {/* LOGIN LINK */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-orange-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>

        </form>

      </motion.div>
    </section>
  );
}

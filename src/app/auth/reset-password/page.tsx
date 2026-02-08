"use client";

import Link from "next/link";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const search = useSearchParams();

  const token = search.get("token") || "";
  const email = search.get("email") || "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!token || !email) {
      setErr("Invalid reset link. Please request a new one.");
      return;
    }

    if (newPassword.length < 6) {
      setErr("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, newPassword }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        setErr(data?.message ?? data?.msg ?? "Reset failed");
        return;
      }

      setMsg(data?.message ?? data?.msg ?? "Password updated successfully!");
      setTimeout(() => router.push("/auth/signin"), 900);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="h-auto overflow-hidden relative py-8 bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-3">
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

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-white/90 backdrop-blur-xl border shadow-xl rounded-3xl p-8 w-full max-w-md text-center"
      >
        <div className="flex justify-center mb-5">
          <div className="bg-orange-100 text-orange-600 p-4 rounded-full">
            <CheckCircle size={34} />
          </div>
        </div>

        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Reset Password
        </h1>

        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Create a new secure password for your{" "}
          <span className="text-orange-600 font-semibold">BazaarFly</span> account.
        </p>

        {err && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-left">
            {err}
          </div>
        )}
        {msg && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 text-left">
            {msg}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="text-left space-y-1">
            <label className="text-sm font-semibold text-gray-700">New Password</label>
            <div className="flex items-center border rounded-xl px-3 focus-within:ring-2 focus-within:ring-orange-500">
              <Lock size={18} className="text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

          <div className="text-left space-y-1">
            <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
            <div className="flex items-center border rounded-xl px-3 focus-within:ring-2 focus-within:ring-orange-500">
              <Lock size={18} className="text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

          <button
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-600">
          Back to{" "}
          <Link href="/auth/signin" className="text-orange-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </section>
  );
}

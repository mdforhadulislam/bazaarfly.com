"use client";

import Link from "next/link";
import { MailCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}

export default function VerifyEmailPage() {
  const search = useSearchParams();
  const token = search.get("token") || "";
  const email = search.get("email") || "";

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const verifyNow = async () => {
    if (!token) {
      setErr("No token found. Please check your email verification link.");
      return;
    }

    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        setErr(data?.message ?? data?.msg ?? "Invalid or expired token");
        return;
      }

      setMsg(data?.message ?? data?.msg ?? "Email verified successfully!");
    } finally {
      setLoading(false);
    }
  };

  // যদি URL এ token থাকে, auto verify
  useEffect(() => {
    if (token) verifyNow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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
            <MailCheck size={34} />
          </div>
        </div>

        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Verify Your Email
        </h1>

        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          {email ? (
            <>
              We’re verifying <span className="font-semibold">{email}</span> for{" "}
              <span className="text-orange-600 font-semibold">BazaarFly</span>.
            </>
          ) : (
            <>
              Please check your inbox and click the verification link for{" "}
              <span className="text-orange-600 font-semibold">BazaarFly</span>.
            </>
          )}
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

        <button
          disabled={loading}
          onClick={verifyNow}
          className="mt-6 w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition disabled:opacity-60"
        >
          {loading ? "Verifying..." : token ? "Verify Now" : "Resend Verification Email"}
        </button>

        <div className="mt-6 text-sm text-gray-600 space-y-2">
          <p>
            Go to{" "}
            <Link
              href="/auth/signin"
              className="text-orange-600 font-semibold hover:underline inline-flex items-center gap-1"
            >
              Login <ArrowRight size={14} />
            </Link>
          </p>

          <p className="text-xs text-gray-400">
            Didn’t receive the email? Check spam or try again.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

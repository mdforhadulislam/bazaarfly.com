"use client";

import Link from "next/link";
import { MailCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function VerifyEmailPage() {
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
            <MailCheck size={34} />
          </div>
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Verify Your Email
        </h1>

        {/* DESCRIPTION */}
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          We’ve sent a verification link to your email address.  
          Please check your inbox and click the link to activate your account on{" "}
          <span className="text-orange-600 font-semibold">BazaarFly</span>.
        </p>

        {/* RESEND BUTTON */}
        <button className="mt-6 w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition">
          Resend Verification Email
        </button>

        {/* FOOTER LINKS */}
        <div className="mt-6 text-sm text-gray-600 space-y-2">
          <p>
            Already verified?{" "}
            <Link href="/auth/login" className="text-orange-600 font-semibold hover:underline inline-flex items-center gap-1">
              Login now <ArrowRight size={14} />
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

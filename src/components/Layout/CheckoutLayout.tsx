"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Package,
  ShoppingCart,
} from "lucide-react";

const steps = [
  { label: "Shopping", icon: ShoppingCart },
  { label: "Cart", icon: Package },
  { label: "Checkout", icon: CreditCard },
  { label: "Payment", icon: CheckCircle },
];

export default function CheckoutLayout({
  currentStep = 1,
  children,
}: {
  currentStep: number;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <section className="bg-gradient-to-br from-orange-50 to-white h-auto py-4 px-4">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* TOP BAR */}
        <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
          <div
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:text-orange-600 transition cursor-pointer group"
          >
            <ArrowLeft size={16} className="text-orange-600 group-hover:-translate-x-1 transition" />
            Back
          </div>

          <p className="text-xs text-gray-500">
            Secure Checkout 🔒
          </p>
        </div>

        {/* STEPPER */}
        <div className="bg-white/80 backdrop-blur border rounded-2xl p-6 pb-4 shadow-sm">

          <div className="relative flex justify-between items-center">

            {/* BASE LINE */}
            <div className="absolute top-1/3 left-0 right-0 h-1 bg-gray-200 rounded-full" />

            {/* PROGRESS BAR */}
            <motion.div
              initial={{ width: "0%" }}
              animate={{
                width: `${(currentStep / (steps.length - 1)) * 100}%`,
              }}
              transition={{ duration: 0.6 }}
              className="absolute top-1/3 left-0 h-1 bg-orange-600 rounded-full"
            />

            {/* STEPS */}
            {steps.map((step, index) => {
              const Icon = step.icon;
              const active = index <= currentStep;
              const completed = index < currentStep;

              return (
                <div key={step.label} className="relative -ml-1 z-10 flex flex-col items-center">

                  <motion.div
                    animate={{
                      scale: active ? 1.15 : 1,
                      backgroundColor: completed
                        ? "#EA580C"
                        : active
                        ? "#EA580C"
                        : "#FED7AA",
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-12 h-12 flex items-center justify-center rounded-full shadow-md text-white"
                  >
                    {completed ? <CheckCircle size={20} /> : <Icon size={20} />}
                  </motion.div>

                  <p className={`mt-2 text-sm font-semibold ${active ? "text-orange-600" : "text-gray-400"}`}>
                    {step.label}
                  </p>

                </div>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-md p-3"
        >
          {children}
        </motion.div>

      </div>
    </section>
  );
}

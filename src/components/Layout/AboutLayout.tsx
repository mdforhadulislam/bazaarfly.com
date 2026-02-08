"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface AboutLayoutProps {
  title: string;
  children: ReactNode;
}

const AboutLayout = ({ title, children }: AboutLayoutProps) => {
  const router = useRouter();

  return (
    <div className="h-auto bg-gray-100 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div
          className="flex items-center gap-2 mb-4 cursor-pointer text-gray-700 hover:text-orange-600 transition"
          onClick={() => router.back()}
        >
          <ArrowLeft size={18} />
          <span className="text-lg font-semibold">{title}</span>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AboutLayout;

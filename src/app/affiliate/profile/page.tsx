"use client";

import { useState } from "react";
import Image from "next/image";

export default function AffiliateProfilePage() {
  const [profile, setProfile] = useState({
    name: "Forhadul Islam",
    email: "forhadul@bazaarfly.com",
    phone: "01930631910",
    affiliateId: "AFF-12345",
    payoutEmail: "forhadul@paypal.com",
    avatar: "/avatar.png",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    alert("Profile updated (demo)");
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">
          Affiliate Profile
        </h1>
        <p className="text-sm text-gray-500">
          Manage your affiliate information.
        </p>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">

        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border">
            <Image
              src={profile.avatar}
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>

          <button className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">
            Change Photo
          </button>
        </div>

        {/* Form */}
        <div className="grid md:grid-cols-2 gap-5">

          <div>
            <label className="text-sm text-gray-600">
              Full Name
            </label>
            <input
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Email Address
            </label>
            <input
              name="email"
              value={profile.email}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Phone Number
            </label>
            <input
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Affiliate ID
            </label>
            <input
              value={profile.affiliateId}
              disabled
              className="w-full border rounded-md px-3 py-2 mt-1 bg-gray-100 text-gray-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">
              Payout Email / Payment Account
            </label>
            <input
              name="payoutEmail"
              value={profile.payoutEmail}
              onChange={handleChange}
              placeholder="PayPal / bKash / Bank email"
              className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700"
        >
          Save Changes
        </button>

      </div>

    </div>
  );
}

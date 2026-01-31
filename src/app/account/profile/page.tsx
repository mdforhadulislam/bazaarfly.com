"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "Forhadul Islam",
    email: "forhadul@example.com",
    phone: "01930631910",
    avatar: "/avatar.png",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    alert("Profile updated (demo)");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Profile Settings</h1>
        <p className="text-sm text-gray-500">
          Update your personal information.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">

        {/* Avatar */}
        <div className="flex flex-col md:flex-row gap-6 md:items-center mb-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border">
            <Image
              src={profile.avatar}
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>

          <div>
            <button className="px-4 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200">
              Change Photo
            </button>

            <p className="text-xs text-gray-500 mt-1">
              JPG or PNG, max 2MB
            </p>
          </div>
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
        </div>

        {/* Save */}
        <div className="mt-6">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

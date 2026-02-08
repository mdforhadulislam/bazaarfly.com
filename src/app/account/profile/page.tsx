"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type ProfileForm = {
  name: string;
  email: string;
  phoneNumber: string;
  avatar?: string; // image url
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const phone = useMemo(() => user?.phoneNumber || "", [user?.phoneNumber]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileForm>({
    name: "",
    email: "",
    phoneNumber: "",
    avatar: "",
  });

  const loadProfile = async () => {
    try {
      setErr(null);
      setOk(null);

      if (!phone) {
        setProfile({ name: "", email: "", phoneNumber: "", avatar: "" });
        return;
      }

      setLoading(true);

      // ✅ your api: /api/account/:phone (assumed)
      const res = await fetch(`/api/account/${phone}/profile`, { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) throw new Error(json?.message || "Failed to load profile");

      const data = json?.data || {};

      setProfile({
        name: data?.name || "",
        email: data?.email || "",
        phoneNumber: data?.phoneNumber || phone,
        avatar: data?.image || data?.avatar || "",
      });
    } catch (e: any) {
      setErr(e?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, phone]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setProfile((p) => ({
      ...p,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setErr(null);
      setOk(null);

      if (!phone) throw new Error("Please login again.");

      // basic validation
      if (!profile.name.trim()) throw new Error("Name is required");
      if (!profile.email.trim()) throw new Error("Email is required");

      setSaving(true);

      const res = await fetch(`/api/account/${phone}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name.trim(),
          email: profile.email.trim(),
          // phoneNumber usually not editable; if editable keep it:
          phoneNumber: profile.phoneNumber.trim(),
          // avatar: profile.avatar (later: upload)
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to update profile");

      setOk("Profile updated successfully.");
      // reload to be safe
      await loadProfile();
    } catch (e: any) {
      setErr(e?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc =
    profile.avatar && profile.avatar.trim().length > 0
      ? profile.avatar
      : "/avatar.png";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Profile Settings</h1>
        <p className="text-sm text-gray-500">Update your personal information.</p>
      </div>

      {/* Alerts */}
      {err && (
        <div className="border border-red-200 bg-red-50 text-red-700 rounded-lg p-3 text-sm">
          {err}
        </div>
      )}
      {ok && (
        <div className="border border-green-200 bg-green-50 text-green-700 rounded-lg p-3 text-sm">
          {ok}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-gray-500">Loading profile...</p>
        ) : (
          <>
            {/* Avatar */}
            <div className="flex flex-col md:flex-row gap-6 md:items-center mb-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border">
                <Image src={avatarSrc} alt="Profile" fill className="object-cover" />
              </div>

              <div>
                {/* ✅ placeholder (next: implement upload -> cloudinary) */}
                <button
                  type="button"
                  onClick={() => alert("Photo upload will be added next (Cloudinary).")}
                  className="px-4 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200"
                >
                  Change Photo
                </button>

                <p className="text-xs text-gray-500 mt-1">JPG or PNG, max 2MB</p>
              </div>
            </div>

            {/* Form */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-gray-600">Full Name</label>
                <input
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Email Address</label>
                <input
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Phone Number</label>
                <input
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
                  // ✅ normally phone is readonly
                  readOnly
                />
                <p className="text-xs text-gray-400 mt-1">Phone number can’t be changed.</p>
              </div>
            </div>

            {/* Save */}
            <div className="mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white rounded-md font-medium"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

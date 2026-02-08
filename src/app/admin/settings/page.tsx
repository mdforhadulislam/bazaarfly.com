"use client";

import { useState } from "react";
import {
  Lock,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AdminSettingsPage() {
  /* ---------------- PASSWORD STATE ---------------- */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  /* ---------------- ROLE STATE ---------------- */
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"user" | "affiliate" | "admin">("user");

  /* ---------------- HANDLERS ---------------- */
  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword) {
      return alert("All password fields are required");
    }

    // TODO: API → /api/v1/admin/change-password
    console.log({ currentPassword, newPassword });
    alert("Password updated (demo)");
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleRoleChange = () => {
    if (!userId) return alert("User ID required");

    // TODO: API → /api/v1/admin/change-role
    console.log({ userId, role });
    alert("User role updated (demo)");
    setUserId("");
    setRole("user");
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Settings
        </h1>
        <p className="text-sm text-gray-500">
          Change password and manage user roles
        </p>
      </div>

      {/* ================= CHANGE PASSWORD ================= */}
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Lock size={18} className="text-orange-600" />
          <h2 className="text-lg font-semibold">
            Change Password
          </h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">
              Current Password
            </label>
            <input
              type={showPass ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">
              New Password
            </label>
            <div className="mt-1 flex items-center gap-2 border rounded-md px-3 py-2">
              <input
                type={showPass ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full outline-none text-sm"
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            onClick={handlePasswordChange}
            className="mt-2 px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* ================= CHANGE ROLE ================= */}
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-orange-600" />
          <h2 className="text-lg font-semibold">
            Change User Role
          </h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">
              User ID
            </label>
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm outline-none"
            >
              <option value="user">User</option>
              <option value="affiliate">Affiliate</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            onClick={handleRoleChange}
            className="mt-2 px-4 py-2 rounded-md bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700"
          >
            Update Role
          </button>
        </div>
      </div>
    </div>
  );
}

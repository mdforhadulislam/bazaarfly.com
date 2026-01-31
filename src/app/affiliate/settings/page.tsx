"use client";

import { useState } from "react";
import { Bell, CreditCard, ShieldAlert } from "lucide-react";

export default function AffiliateSettingsPage() {
  const [settings, setSettings] = useState({
    emailNotification: true,
    smsNotification: false,
    pushNotification: true,
    payoutMethod: "bKash",
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const Toggle = ({
    enabled,
    onChange,
  }: {
    enabled: boolean;
    onChange: () => void;
  }) => (
    <button
      onClick={onChange}
      className={`w-11 h-6 flex items-center rounded-full transition ${
        enabled ? "bg-orange-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
          enabled ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm text-gray-500">
          Manage your affiliate account preferences.
        </p>
      </div>

      {/* Notification Settings */}
      <div className="bg-white border rounded-xl p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-orange-600" />
          <h2 className="font-semibold">Notifications</h2>
        </div>

        <div className="space-y-4">
          {[
            { key: "emailNotification", label: "Email Updates" },
            { key: "smsNotification", label: "SMS Alerts" },
            { key: "pushNotification", label: "Push Notifications" },
          ].map((item) => (
            <div
              key={item.key}
              className="flex justify-between items-center border rounded-lg p-4"
            >
              <p className="text-sm font-medium">{item.label}</p>

              <Toggle
                enabled={
                  settings[item.key as keyof typeof settings] as boolean
                }
                onChange={() =>
                  toggle(item.key as keyof typeof settings)
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Payout Settings */}
      <div className="bg-white border rounded-xl p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-2">
          <CreditCard size={18} className="text-orange-600" />
          <h2 className="font-semibold">Payout Settings</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <label className="text-sm text-gray-600">
              Payout Method
            </label>
            <select
              value={settings.payoutMethod}
              onChange={(e) =>
                setSettings({ ...settings, payoutMethod: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 mt-2 focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option>bKash</option>
              <option>Nagad</option>
              <option>Rocket</option>
              <option>Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Account Holder Name
            </label>
            <input
              placeholder="Account owner name"
              className="w-full border rounded-lg px-3 py-2 mt-2 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">
              Account Number / Details
            </label>
            <input
              placeholder="Mobile number / bank account"
              className="w-full border rounded-lg px-3 py-2 mt-2 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

        </div>

        <button className="px-5 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">
          Save Payout Info
        </button>
      </div>

      {/* Password Update */}
      <div className="bg-white border rounded-xl p-6 space-y-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-orange-600" />
          <h2 className="font-semibold">Update Password</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">

          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">
              Current Password
            </label>
            <input
              type="password"
              placeholder="Enter current password"
              className="w-full border rounded-lg px-3 py-2 mt-2 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              New Password
            </label>
            <input
              type="password"
              placeholder="New password"
              className="w-full border rounded-lg px-3 py-2 mt-2 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm password"
              className="w-full border rounded-lg px-3 py-2 mt-2 focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

        </div>

        <button className="px-5 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">
          Update Password
        </button>
      </div>

      {/* Security */}
      <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">
        <h2 className="font-semibold">Security</h2>

        <p className="text-sm text-gray-500">
          Advanced security settings are available in your main account panel.
        </p>

        <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">
          Go to Account Security
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-3">
        <h2 className="font-semibold text-red-600">Danger Zone</h2>

        <p className="text-sm text-red-500">
          Deactivating your affiliate account will permanently stop earnings.
        </p>

        <button className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
          Deactivate Affiliate Account
        </button>
      </div>

    </div>
  );
}

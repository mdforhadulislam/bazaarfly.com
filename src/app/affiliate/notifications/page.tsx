"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useState } from "react";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  clickAction?: {
    url: string;
    external: boolean;
  };
};

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "New Commission Earned",
    message: "You earned ৳120 commission from an order.",
    type: "commission",
    isRead: false,
    createdAt: "2 hours ago",
    clickAction: {
      url: "/affiliate/orders",
      external: false,
    },
  },
  {
    id: "2",
    title: "Withdraw Completed",
    message: "Your withdrawal request has been completed.",
    type: "withdraw",
    isRead: true,
    createdAt: "1 day ago",
  },
];

function typeColor(type: string) {
  switch (type) {
    case "commission":
      return "bg-green-100 text-green-600";
    case "withdraw":
      return "bg-blue-100 text-blue-600";
    case "order":
      return "bg-orange-100 text-orange-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function AffiliateNotificationsPage() {
  const [notifications, setNotifications] =
    useState(initialNotifications);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Bell className="text-orange-600" size={20} />
        <div>
          <h1 className="text-xl font-bold">
            Notifications
          </h1>
          <p className="text-sm text-gray-500">
            Affiliate activity updates and alerts.
          </p>
        </div>
      </div>

      {/* Notification List */}
      <div className="bg-white border rounded-xl overflow-hidden">

        {notifications.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No notifications yet.
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-5 hover:bg-gray-50 flex flex-col md:flex-row md:justify-between md:items-center gap-3 ${
                  !n.isRead ? "bg-orange-50/40" : ""
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">
                      {n.title}
                    </p>

                    <span
                      className={`px-2 py-0.5 rounded text-xs ${typeColor(
                        n.type
                      )}`}
                    >
                      {n.type}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    {n.message}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    {n.createdAt}
                  </p>
                </div>

                <div className="flex gap-3 items-center">

                  {n.clickAction && (
                    <Link
                      href={n.clickAction.url}
                      target={
                        n.clickAction.external
                          ? "_blank"
                          : "_self"
                      }
                      onClick={() => markAsRead(n.id)}
                      className="text-sm text-orange-600"
                    >
                      View
                    </Link>
                  )}

                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-xs text-gray-500 hover:text-orange-600"
                    >
                      Mark as read
                    </button>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

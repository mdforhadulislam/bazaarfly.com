"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, Mail, Smartphone, MessageSquare } from "lucide-react";

type Channel = "in_app" | "email" | "push" | "sms";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;

  clickAction?: {
    url: string;
    external: boolean;
  };

  channels: Channel[];

  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      _id: "1",
      type: "order_update",
      title: "Order Shipped",
      message: "Your order ORD-1001 has been shipped.",
      channels: ["in_app", "push"],
      isRead: false,
      createdAt: "2 hours ago",
      clickAction: {
        url: "/account/orders/ORD-1001",
        external: false,
      },
    },
    {
      _id: "2",
      type: "payment",
      title: "Payment Confirmed",
      message: "Payment received successfully.",
      channels: ["in_app", "email"],
      isRead: true,
      createdAt: "Yesterday",
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      )
    );
  };

  const openNotification = (n: Notification) => {
    markAsRead(n._id);

    if (!n.clickAction) return;

    if (n.clickAction.external) {
      window.open(n.clickAction.url, "_blank");
    } else {
      router.push(n.clickAction.url);
    }
  };

  const channelIcon = (channel: Channel) => {
    if (channel === "email") return <Mail size={14} />;
    if (channel === "push") return <Smartphone size={14} />;
    if (channel === "sms") return <MessageSquare size={14} />;
    return <Bell size={14} />;
  };

  const unreadCount = notifications.filter(
    (n) => !n.isRead
  ).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Notifications</h1>
        <p className="text-sm text-gray-500">
          {unreadCount} unread notifications
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center text-gray-500">
          No notifications available.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => openNotification(n)}
              className={`bg-white border rounded-xl p-4 cursor-pointer transition hover:shadow-sm ${
                !n.isRead
                  ? "border-orange-300 bg-orange-50"
                  : ""
              }`}
            >
              <div className="flex gap-3">
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-full ${
                    n.isRead
                      ? "bg-gray-100 text-gray-500"
                      : "bg-orange-600 text-white"
                  }`}
                >
                  <Bell size={16} />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start gap-3">
                    <p className="font-semibold text-sm">
                      {n.title}
                    </p>

                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {n.createdAt}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    {n.message}
                  </p>

                  {/* Channels */}
                  <div className="flex gap-2 mt-2">
                    {n.channels.map((ch) => (
                      <span
                        key={ch}
                        className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 rounded"
                      >
                        {channelIcon(ch)}
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

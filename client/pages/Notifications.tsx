import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWallet } from "@/contexts/WalletContext";
import {
  countUnreadNotifications,
  markAllAsRead,
  readLastSeenAt,
  readNotifications,
  type UserNotification,
} from "@/lib/notifications";

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function Notifications() {
  const { walletAddress } = useWallet();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setNotifications([]);
      setLastSeenAt(null);
      return;
    }

    setNotifications(readNotifications(walletAddress));
    setLastSeenAt(readLastSeenAt(walletAddress));
  }, [walletAddress]);

  const unreadCount = useMemo(
    () => countUnreadNotifications(notifications, lastSeenAt),
    [notifications, lastSeenAt],
  );

  const handleMarkRead = () => {
    if (!walletAddress) {
      return;
    }
    const next = markAllAsRead(walletAddress);
    setLastSeenAt(next);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--background))] to-[hsl(var(--card))]/30">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="rounded-3xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-red-500 text-white text-xs font-bold">
                      {unreadCount}
                    </span>
                  )}
                </h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Order and delivery updates for your account</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkRead}
                disabled={notifications.length === 0 || unreadCount === 0}
                className="px-3 py-2 text-sm rounded-lg border border-[hsl(var(--border))] disabled:opacity-50"
              >
                Mark all as read
              </button>
            </div>
          </div>
        </div>

        <section className="rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-3">
          {notifications.length === 0 && (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">No notifications yet.</p>
          )}

          {notifications.map((notification) => {
            const isUnread = !lastSeenAt || +new Date(notification.createdAt) > +new Date(lastSeenAt);

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => navigate(`/dashboard?order=${encodeURIComponent(notification.orderId)}`)}
                className="w-full text-left rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--card))] transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-[hsl(var(--foreground))]">
                    {notification.kind === "delivery" ? "Delivery update" : "Order update"}
                  </p>
                  <div className="flex items-center gap-2">
                    {isUnread && (
                      <span className="text-[10px] uppercase tracking-wide font-bold text-red-500">Unread</span>
                    )}
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {formatDateTime(notification.createdAt)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                  {notification.itemName} is now <span className="font-semibold text-[hsl(var(--foreground))]">{notification.status}</span>
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 font-mono">Order: {notification.orderId}</p>
              </button>
            );
          })}
        </section>
      </main>

      <Footer />
    </div>
  );
}

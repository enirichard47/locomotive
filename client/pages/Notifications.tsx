import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWallet } from "@/contexts/WalletContext";
import {
  countUnreadNotifications,
  markAllAsRead,
  markAsRead,
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
    // Reload notifications from localStorage to reflect the read state
    setNotifications(readNotifications(walletAddress));
  };

  const handleNotificationClick = (notification: UserNotification) => {
    if (walletAddress) {
      const updated = markAsRead(walletAddress, notification.id);
      setNotifications(updated);
    }
    navigate(`/dashboard?order=${encodeURIComponent(notification.orderId)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        {/* Back Link */}
        <div className="mb-12">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-gray-500 hover:text-black transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
        </div>

        {/* Section Header */}
        <div className="border-b border-gray-200 pb-12 mb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-red-600 mb-4 block">Activity Feed</span>
            <h1 className="font-serif text-5xl sm:text-7xl uppercase tracking-tighter mb-4 leading-none">
              Your <span className="italic font-light text-red-600 pr-2">Inbox</span> & <br />Updates
            </h1>
            <p className="text-gray-500 font-serif italic text-lg max-w-md mt-2">
              Real-time design iterations, dispatch timestamps, and direct receipts for your custom caps.
            </p>
          </div>
          
          <div className="flex items-center gap-4 self-start md:self-end">
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 bg-red-50 text-red-600 rounded-sm border border-red-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                {unreadCount} Unread
              </span>
            )}
            
            <button
              onClick={handleMarkRead}
              disabled={notifications.length === 0 || unreadCount === 0}
              className="px-6 py-3.5 border border-gray-300 font-bold uppercase tracking-widest text-[9px] hover:border-black transition-all disabled:opacity-30 disabled:hover:border-gray-300 disabled:cursor-not-allowed bg-white text-black"
            >
              Mark all as read
            </button>
          </div>
        </div>

        {/* Notification Feed List */}
        <section className="space-y-0 divide-y divide-gray-100 border-t border-b border-gray-200">
          {notifications.length === 0 ? (
            <div className="py-24 text-center space-y-4">
              <Bell className="w-16 h-16 text-gray-300 mx-auto animate-pulse-slow" />
              <p className="text-gray-400 font-serif italic text-lg">Your inbox is completely clear.</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-300">No new alerts found</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const isUnread = notification.isRead !== true && (!lastSeenAt || +new Date(notification.createdAt) > +new Date(lastSeenAt));

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left py-8 px-4 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-500 relative group border-l-2 ${
                    isUnread ? "bg-red-50/10 hover:bg-red-50/20 border-l-red-600" : "hover:bg-gray-50/50 border-l-transparent"
                  }`}
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-3">
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-red-600 inline-block animate-ping absolute left-1" />
                      )}
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${notification.kind === "delivery" ? "text-red-600" : "text-black"}`}>
                        {notification.kind === "delivery" ? "Delivery Dispatch" : "Production Update"}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 tracking-wider">Order: {notification.orderId}</span>
                    </div>

                    <h3 className="font-serif text-2xl text-black group-hover:text-red-600 transition-colors flex items-baseline gap-2">
                      {notification.itemName}
                      <span className="text-sm font-light italic text-gray-400 font-serif lowercase">
                        is now {notification.status}
                      </span>
                    </h3>

                    <p className="text-sm text-gray-500 font-light leading-relaxed">
                      {notification.kind === "delivery" 
                        ? `Great news! Your custom ${notification.itemName} has been processed under status "${notification.status}" and is heading to your designated address.`
                        : `Your creation "${notification.itemName}" has completed its status check and is verified as "${notification.status}" by the studio.`}
                    </p>
                  </div>

                  <div className="text-left md:text-right flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end gap-2 shrink-0">
                    <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">
                      {formatDateTime(notification.createdAt)}
                    </span>
                    {isUnread && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-red-600 bg-red-100/50 px-2 py-0.5 rounded-sm">
                        Unread
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

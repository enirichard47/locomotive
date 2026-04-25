import { Link, NavLink } from "react-router-dom";
import { Bell, Menu, X, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ConnectWallet from "./ConnectWallet";
import { useWallet } from "@/contexts/WalletContext";
import {
  countUnreadNotifications,
  NOTIFICATIONS_CHANGED_EVENT,
  readLastSeenAt,
  readNotifications,
} from "@/lib/notifications";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isConnected, walletAddress, isAdmin } = useWallet();
  const canAccessAdmin = isAdmin;
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = () => {
    if (!walletAddress || canAccessAdmin) {
      setUnreadCount(0);
      return;
    }

    const notifications = readNotifications(walletAddress);
    const lastSeen = readLastSeenAt(walletAddress);
    setUnreadCount(countUnreadNotifications(notifications, lastSeen));
  };

  useEffect(() => {
    refreshUnreadCount();

    const handleNotificationsChanged = () => refreshUnreadCount();
    const handleStorage = () => refreshUnreadCount();

    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handleNotificationsChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, handleNotificationsChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, [walletAddress, canAccessAdmin]);

  const bellBadge = useMemo(() => {
    if (unreadCount <= 0) {
      return null;
    }

    return (
      <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    );
  }, [unreadCount]);
  
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `relative px-6 py-2.5 font-medium text-sm transition-colors duration-300 after:absolute after:left-3 after:right-3 after:-bottom-1 after:h-[2px] after:rounded-full after:bg-[hsl(var(--primary))] after:transition-transform after:duration-300 ${
      isActive
        ? "text-[hsl(var(--foreground))] after:scale-x-100"
        : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] after:scale-x-0 hover:after:scale-x-100"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[hsl(var(--border))]/50 bg-[hsl(var(--background))]/80 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 rounded-full bg-[hsl(var(--card))]/50 backdrop-blur-sm border border-[hsl(var(--border))]/50 px-4 sm:px-6 lg:px-8 my-2 sm:my-3">
          {/* Logo */}
          <Link 
            to={isConnected ? (canAccessAdmin ? "/admin" : "/dashboard") : "/"} 
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))]/20 to-purple-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--card))]/80 border-2 border-[hsl(var(--border))] overflow-hidden group-hover:border-[hsl(var(--primary))]/50 transition-all duration-300 group-hover:scale-105">
                <img
                  src="/locomotive_logo.png"
                  alt="Locomotive"
                  className="w-full h-full object-contain p-2"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-[hsl(var(--foreground))] to-[hsl(var(--primary))] bg-clip-text text-transparent">
                LOCOMOTIVE
              </span>
              <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium tracking-wide hidden sm:block">
                Identity Engineering
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-5">
            {isConnected && (
              <NavLink to="/dashboard" className={navLinkClasses}>
                Dashboard
              </NavLink>
            )}
            {isConnected && canAccessAdmin && (
              <NavLink to="/admin" className={navLinkClasses}>
                Admin
              </NavLink>
            )}
            {!isConnected && (
              <NavLink to="/" className={navLinkClasses}>
                Home
              </NavLink>
            )}
            <NavLink to="/identity-engineering" className={navLinkClasses}>
              Create
            </NavLink>
            <NavLink to="/merch-designs" className={navLinkClasses}>
              Collections
            </NavLink>
          </nav>

          {/* Connect Wallet Button */}
          <div className="hidden md:flex items-center gap-3">
            {isConnected && !canAccessAdmin && (
              <Link
                to="/notifications"
                className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-[hsl(var(--foreground))]" />
                {bellBadge}
              </Link>
            )}
            <ConnectWallet />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-1">
            {isConnected && !canAccessAdmin && (
              <Link
                to="/notifications"
                className="relative p-2 rounded-xl hover:bg-gradient-to-r hover:from-[hsl(var(--primary))]/10 hover:to-[hsl(var(--primary))]/5 transition-colors"
                aria-label="Notifications"
                onClick={() => setIsMenuOpen(false)}
              >
                <Bell className="w-5 h-5 text-[hsl(var(--foreground))]" />
                {bellBadge}
              </Link>
            )}
            <button
              className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-[hsl(var(--primary))]/10 hover:to-[hsl(var(--primary))]/5 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-[hsl(var(--foreground))]" />
              ) : (
                <Menu className="w-5 h-5 text-[hsl(var(--foreground))]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 pt-1.5 border-t border-[hsl(var(--border))]/50 mt-2">
            <div className="flex flex-col gap-1.5">
              {isConnected && (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => 
                    `px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                      isActive
                        ? "text-[hsl(var(--foreground))] border-l-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                        : "text-[hsl(var(--muted-foreground))] hover:bg-gradient-to-r hover:from-[hsl(var(--primary))]/15 hover:to-[hsl(var(--primary))]/10 hover:text-[hsl(var(--foreground))]"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Dashboard
                  </div>
                </NavLink>
              )}
              {isConnected && canAccessAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => 
                    `px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                      isActive
                        ? "text-[hsl(var(--foreground))] border-l-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                        : "text-[hsl(var(--muted-foreground))] hover:bg-gradient-to-r hover:from-[hsl(var(--primary))]/15 hover:to-[hsl(var(--primary))]/10 hover:text-[hsl(var(--foreground))]"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin
                </NavLink>
              )}
              {!isConnected && (
                <NavLink
                  to="/"
                  className={({ isActive }) => 
                    `px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                      isActive
                        ? "text-[hsl(var(--foreground))] border-l-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                        : "text-[hsl(var(--muted-foreground))] hover:bg-gradient-to-r hover:from-[hsl(var(--primary))]/15 hover:to-[hsl(var(--primary))]/10 hover:text-[hsl(var(--foreground))]"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </NavLink>
              )}
              <NavLink
                to="/identity-engineering"
                className={({ isActive }) => 
                  `px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                    isActive
                      ? "text-[hsl(var(--foreground))] border-l-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                      : "text-[hsl(var(--muted-foreground))] hover:bg-gradient-to-r hover:from-[hsl(var(--primary))]/15 hover:to-[hsl(var(--primary))]/10 hover:text-[hsl(var(--foreground))]"
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Create
              </NavLink>
              <NavLink
                to="/merch-designs"
                className={({ isActive }) => 
                  `px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                    isActive
                      ? "text-[hsl(var(--foreground))] border-l-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                      : "text-[hsl(var(--muted-foreground))] hover:bg-gradient-to-r hover:from-[hsl(var(--primary))]/15 hover:to-[hsl(var(--primary))]/10 hover:text-[hsl(var(--foreground))]"
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Collections
              </NavLink>
            </div>
            <div className="mt-3 pt-3 border-t border-[hsl(var(--border))]/50">
              <ConnectWallet />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

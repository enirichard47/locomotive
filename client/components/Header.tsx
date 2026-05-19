import { Link, NavLink } from "react-router-dom";
import { Bell, Menu, X } from "lucide-react";
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
      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[14px] h-[14px] rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-[8px] font-bold">
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    );
  }, [unreadCount]);
  
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `relative py-1 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 hover:text-[hsl(var(--primary))] ${
      isActive
        ? "text-[hsl(var(--primary))]"
        : "text-[hsl(var(--muted-foreground))]"
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Elegant Announcement Bar */}
      <div className="bg-black text-white py-2.5 px-4 text-center border-b border-white/10 overflow-hidden">
        <p className="text-[9px] uppercase tracking-[0.5em] font-bold animate-pulse-slow">
          Hate Collection Open — Limited time <span className="text-[hsl(var(--primary))] italic">50% Presale Privilege</span> in effect.
        </p>
      </div>

      <div className="bg-[hsl(var(--background))]/80 backdrop-blur-md border-b border-[hsl(var(--border))]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link 
            to={isConnected ? (canAccessAdmin ? "/admin" : "/dashboard") : "/"} 
            className="flex items-center gap-2 group"
          >
            <span className="font-serif text-2xl tracking-tight text-[hsl(var(--foreground))]">
              LOCOMOTIVE
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            {!isConnected && (
              <NavLink to="/" className={navLinkClasses}>
                Home
              </NavLink>
            )}
            <NavLink to="/merch-designs" className={navLinkClasses}>
              The Archive
            </NavLink>
            <NavLink to="/identity-engineering" className={navLinkClasses}>
              The Studio
            </NavLink>
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
          </nav>

          {/* Connect Wallet Button */}
          <div className="hidden md:flex items-center gap-6">
            {isConnected && !canAccessAdmin && (
              <Link
                to="/notifications"
                className="relative text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {bellBadge}
              </Link>
            )}
            <ConnectWallet />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {isConnected && !canAccessAdmin && (
              <Link
                to="/notifications"
                className="relative text-[hsl(var(--muted-foreground))]"
                aria-label="Notifications"
                onClick={() => setIsMenuOpen(false)}
              >
                <Bell className="w-5 h-5" />
                {bellBadge}
              </Link>
            )}
            <button
              className="text-[hsl(var(--foreground))]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden bg-[hsl(var(--background))] border-t border-[hsl(var(--border))] py-8 px-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col gap-6 items-center text-center">
            {!isConnected && (
              <NavLink to="/" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>
                Home
              </NavLink>
            )}
            <NavLink to="/merch-designs" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>
              The Archive
            </NavLink>
            <NavLink to="/identity-engineering" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>
              The Studio
            </NavLink>
            {isConnected && (
              <NavLink to="/dashboard" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </NavLink>
            )}
            {isConnected && canAccessAdmin && (
              <NavLink to="/admin" className={navLinkClasses} onClick={() => setIsMenuOpen(false)}>
                Admin
              </NavLink>
            )}
            <div className="pt-4 border-t border-[hsl(var(--border))] w-full flex justify-center">
              <ConnectWallet />
            </div>
          </div>
        </nav>
      )}
      </div>
    </header>
  );
}

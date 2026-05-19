import { Link, NavLink } from "react-router-dom";
import ConnectWallet from "./ConnectWallet";
import { useWallet } from "@/contexts/WalletContext";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function AdminHeader() {
  const { walletAddress } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `relative py-1 text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 hover:text-[hsl(var(--primary))] ${
      isActive
        ? "text-[hsl(var(--primary))]"
        : "text-[hsl(var(--muted-foreground))]"
    }`;

  return (
    <header className="sticky top-0 z-50">
      {/* Elegant Admin Announcement Bar */}
      <div className="bg-black text-white py-2.5 px-4 text-center border-b border-white/10">
        <p className="text-[9px] uppercase tracking-[0.5em] font-bold animate-pulse-slow">
          Admin Control Studio — Authorized Personnel Only
        </p>
      </div>

      <div className="bg-[hsl(var(--background))]/85 backdrop-blur-md border-b border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo & Branding */}
            <Link to="/admin" className="flex items-center gap-3 group">
              <span className="font-serif text-2xl tracking-tight text-[hsl(var(--foreground))] transition-colors group-hover:text-[hsl(var(--primary))]">
                LOCOMOTIVE
              </span>
              <div className="h-5 w-[1px] bg-[hsl(var(--border))] hidden sm:block" />
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[hsl(var(--primary))] hidden sm:inline">
                Control Studio
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-10">
              <NavLink to="/admin" end className={navLinkClasses}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/collections" className={navLinkClasses}>
                Collections
              </NavLink>
              <NavLink to="/admin/orders" className={navLinkClasses}>
                Orders
              </NavLink>
            </nav>

            {/* Connect Wallet Button - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <ConnectWallet />
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-xl text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors"
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden bg-[hsl(var(--background))] border-t border-[hsl(var(--border))] py-6 px-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex flex-col gap-5 items-center text-center">
              <NavLink
                to="/admin"
                end
                className={navLinkClasses}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/admin/collections"
                className={navLinkClasses}
                onClick={() => setIsMenuOpen(false)}
              >
                Collections
              </NavLink>
              <NavLink
                to="/admin/orders"
                className={navLinkClasses}
                onClick={() => setIsMenuOpen(false)}
              >
                Orders
              </NavLink>
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


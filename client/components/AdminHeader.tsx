import { Link, NavLink } from "react-router-dom";
import ConnectWallet from "./ConnectWallet";
import { useWallet } from "@/contexts/WalletContext";
import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";

export default function AdminHeader() {
  const { walletAddress } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `relative px-6 py-2.5 font-medium text-sm transition-colors duration-300 after:absolute after:left-3 after:right-3 after:-bottom-1 after:h-[2px] after:rounded-full after:bg-[hsl(var(--primary))] after:transition-transform after:duration-300 ${
      isActive
        ? "text-[hsl(var(--foreground))] after:scale-x-100"
        : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] after:scale-x-0 hover:after:scale-x-100"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b-2 border-[hsl(var(--border))]/50 bg-[hsl(var(--background))]/80 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 rounded-full bg-[hsl(var(--card))]/50 backdrop-blur-sm border border-[hsl(var(--border))]/50 px-4 sm:px-6 lg:px-8 my-3">
          {/* Logo & Branding */}
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))]/20 to-purple-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--card))]/80 border-2 border-[hsl(var(--border))] overflow-hidden group-hover:border-[hsl(var(--primary))]/50 transition-all duration-300 group-hover:scale-105">
                <img
                  src="/locomotive_logo.png"
                  alt="Locomotive"
                  className="w-full h-full object-contain p-2"
                />
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-[hsl(var(--primary))]" />
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-[hsl(var(--foreground))] to-[hsl(var(--primary))] bg-clip-text text-transparent">
                  ADMIN
                </span>
                <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium tracking-wide hidden sm:block">
                  Control Center
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-5">
            <NavLink to="/admin" end className={navLinkClasses}>
              Dashboard
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
            className="md:hidden p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-[hsl(var(--primary))]/10 hover:to-[hsl(var(--primary))]/5 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-[hsl(var(--foreground))]" />
            ) : (
              <Menu className="w-6 h-6 text-[hsl(var(--foreground))]" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-6 pt-2 border-t border-[hsl(var(--border))]/50 mt-4">
            <div className="flex flex-col gap-2">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) => 
                  `px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActive
                      ? "text-[hsl(var(--foreground))] border-l-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                      : "text-[hsl(var(--muted-foreground))] hover:bg-gradient-to-r hover:from-[hsl(var(--primary))]/15 hover:to-[hsl(var(--primary))]/10 hover:text-[hsl(var(--foreground))]"
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/admin/orders"
                className={({ isActive }) => 
                  `px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActive
                      ? "text-[hsl(var(--foreground))] border-l-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5"
                      : "text-[hsl(var(--muted-foreground))] hover:bg-gradient-to-r hover:from-[hsl(var(--primary))]/15 hover:to-[hsl(var(--primary))]/10 hover:text-[hsl(var(--foreground))]"
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Orders
              </NavLink>
            </div>
            <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]/50">
              <ConnectWallet />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import ConnectWallet from "./ConnectWallet";
import { useWallet } from "@/contexts/WalletContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isConnected } = useWallet();
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `relative text-sm font-medium transition-colors hover:text-[hsl(var(--foreground))] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-full after:bg-[hsl(var(--primary))] after:transition-transform after:duration-300 after:scale-x-0 hover:after:scale-x-100 ${
      isActive ? "text-[hsl(var(--foreground))] after:scale-x-100" : "text-[hsl(var(--muted-foreground))]"
    }`;

  return (
    <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={isConnected ? "/dashboard" : "/"} className="flex items-center gap-2">
            <img
              src="/locomotive_logo.png"
              alt="Locomotive logo"
              className="w-10 h-10 rounded bg-[hsl(var(--card))] border border-[hsl(var(--border))] object-contain"
            />
            <span className="font-bold text-xl hidden sm:inline tracking-tight text-[hsl(var(--foreground))]">
              LOCOMOTIVE
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {isConnected && (
              <NavLink
                to="/dashboard"
                className={navLinkClasses}
              >
                Dashboard
              </NavLink>
            )}
            {!isConnected && (
              <NavLink
                to="/"
                className={navLinkClasses}
              >
                Home
              </NavLink>
            )}
            <NavLink
              to="/identity-engineering"
              className={navLinkClasses}
            >
              Identity Engineering
            </NavLink>
            <NavLink
              to="/merch-designs"
              className={navLinkClasses}
            >
              Merch Designs
            </NavLink>
            <NavLink
              to="/community"
              className={navLinkClasses}
            >
              Community Train
            </NavLink>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <ConnectWallet />
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-[hsl(var(--foreground))]" />
            ) : (
              <Menu className="w-6 h-6 text-[hsl(var(--foreground))]" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-2">
            {isConnected && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `py-2 text-sm font-medium transition-colors ${isActive ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'} hover:text-[hsl(var(--foreground))]`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </NavLink>
            )}
            {!isConnected && (
              <NavLink
                to="/"
                className={({ isActive }) => `py-2 text-sm font-medium transition-colors ${isActive ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'} hover:text-[hsl(var(--foreground))]`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </NavLink>
            )}
            <NavLink
              to="/identity-engineering"
              className={({ isActive }) => `py-2 text-sm font-medium transition-colors ${isActive ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'} hover:text-[hsl(var(--foreground))]`}
              onClick={() => setIsMenuOpen(false)}
            >
              Identity Engineering
            </NavLink>
            <NavLink
              to="/merch-designs"
              className={({ isActive }) => `py-2 text-sm font-medium transition-colors ${isActive ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'} hover:text-[hsl(var(--foreground))]`}
              onClick={() => setIsMenuOpen(false)}
            >
              Merch Designs
            </NavLink>
            <NavLink
              to="/community"
              className={({ isActive }) => `py-2 text-sm font-medium transition-colors ${isActive ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'} hover:text-[hsl(var(--foreground))]`}
              onClick={() => setIsMenuOpen(false)}
            >
              Community Train
            </NavLink>
            <div className="mt-4">
              <ConnectWallet />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

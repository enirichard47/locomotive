import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import ConnectWallet from "./ConnectWallet";
import { useWallet } from "@/contexts/WalletContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isConnected } = useWallet();

  return (
    <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={isConnected ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded">
              <span className="text-[hsl(var(--primary-foreground))] font-bold text-lg">⚡</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline tracking-tight text-[hsl(var(--foreground))]">
              LOCOMOTIVE
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {isConnected && (
              <Link
                to="/dashboard"
                className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition"
              >
                Dashboard
              </Link>
            )}
            {!isConnected && (
              <Link
                to="/"
                className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition"
              >
                Home
              </Link>
            )}
            <Link
              to="/custom-made"
              className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition"
            >
              Custom Made
            </Link>
            <Link
              to="/merch"
              className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition"
            >
              Merch
            </Link>
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
              <Link
                to="/dashboard"
                className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {!isConnected && (
              <Link
                to="/"
                className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
            )}
            <Link
              to="/custom-made"
              className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Custom Made
            </Link>
            <Link
              to="/merch"
              className="text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Merch
            </Link>
            <div className="mt-4">
              <ConnectWallet />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

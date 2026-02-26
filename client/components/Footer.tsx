import { Link } from "react-router-dom";
import { Github, Twitter, Disc } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

export default function Footer() {
  const { isConnected } = useWallet();

  if (isConnected) {
    return null;
  }
  const socialLinks = [
    { icon: Twitter, href: "#", name: "Twitter" },
    { icon: Github, href: "#", name: "GitHub" },
    { icon: Disc, href: "#", name: "Discord" },
  ];

  return (
    <footer className="bg-[hsl(var(--card))] border-t border-[hsl(var(--border))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid md:grid-cols-12 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-4">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src="/locomotive_logo.png" alt="Locomotive Logo" className="w-8 h-8 object-contain" />
              <span className="font-bold text-xl tracking-tight text-[hsl(var(--foreground))]">
                LOCOMOTIVE
              </span>
            </Link>
            <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-xs">
              The Web3 Identity Engineering platform for creators and brands.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-4 text-[hsl(var(--foreground))] tracking-wider uppercase text-sm">Platform</h4>
              <ul className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
                <li><Link to="/identity-engineering" className="hover:text-[hsl(var(--primary))] transition">Engineering</Link></li>
                <li><Link to="/merch-designs" className="hover:text-[hsl(var(--primary))] transition">Collections</Link></li>
                <li><Link to="/community" className="hover:text-[hsl(var(--primary))] transition">Locomotive Train</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[hsl(var(--foreground))] tracking-wider uppercase text-sm">Resources</h4>
              <ul className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
                <li><a href="#" className="hover:text-[hsl(var(--primary))] transition">Docs</a></li>
                <li><a href="#" className="hover:text-[hsl(var(--primary))] transition">Blog</a></li>
                <li><a href="#" className="hover:text-[hsl(var(--primary))] transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[hsl(var(--foreground))] tracking-wider uppercase text-sm">Legal</h4>
              <ul className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
                <li><a href="#" className="hover:text-[hsl(var(--primary))] transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[hsl(var(--primary))] transition">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-[hsl(var(--border))] py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">&copy; {new Date().getFullYear()} Locomotive. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition">
                <span className="sr-only">{link.name}</span>
                <link.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
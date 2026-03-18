import { Link } from "react-router-dom";
import { Github, Twitter, Disc, ShoppingBag, Users } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

export default function Footer() {
  const { isConnected, isAdmin } = useWallet();
  
  const socialLinks = [
    { icon: Twitter, href: "#", name: "Twitter" },
    { icon: Github, href: "#", name: "GitHub" },
    { icon: Disc, href: "#", name: "Discord" },
  ];

  // Logged-in footer
  if (isConnected) {
    return (
      <footer className="bg-gradient-to-br from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--primary))]/5 border-t-2 border-[hsl(var(--border))] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 grid md:grid-cols-12 gap-8">
            {/* Logo and description */}
            <div className="md:col-span-6">
              <Link to="/" className="flex items-center gap-3 mb-4 group">
                <img 
                  src="/locomotive_logo.png" 
                  alt="Locomotive Logo" 
                  className="w-10 h-10 object-contain rounded-xl group-hover:scale-110 transition-transform" 
                />
                <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-[hsl(var(--foreground))] to-[hsl(var(--primary))] bg-clip-text text-transparent">
                  LOCOMOTIVE
                </span>
              </Link>
              <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-sm leading-relaxed">
                Engineering digital identity through Web3-powered custom merchandise and AI-driven design tools.
              </p>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-6 grid grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="w-4 h-4 text-[hsl(var(--primary))]" />
                  <h4 className="font-bold text-[hsl(var(--foreground))] tracking-wider uppercase text-xs">{isAdmin ? "Admin" : "Shop"}</h4>
                </div>
                <ul className="space-y-3 text-sm">
                  {isAdmin ? (
                    <>
                      <li>
                        <Link to="/admin" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors flex items-center gap-2 group">
                          <span className="w-1 h-1 rounded-full bg-[hsl(var(--muted-foreground))] group-hover:bg-[hsl(var(--primary))] transition-colors"></span>
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/collections" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors flex items-center gap-2 group">
                          <span className="w-1 h-1 rounded-full bg-[hsl(var(--muted-foreground))] group-hover:bg-[hsl(var(--primary))] transition-colors"></span>
                          Curation Studio
                        </Link>
                      </li>
                      <li>
                        <Link to="/admin/orders" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors flex items-center gap-2 group">
                          <span className="w-1 h-1 rounded-full bg-[hsl(var(--muted-foreground))] group-hover:bg-[hsl(var(--primary))] transition-colors"></span>
                          Orders
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link to="/merch-designs" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors flex items-center gap-2 group">
                          <span className="w-1 h-1 rounded-full bg-[hsl(var(--muted-foreground))] group-hover:bg-[hsl(var(--primary))] transition-colors"></span>
                          Collections
                        </Link>
                      </li>
                      <li>
                        <Link to="/identity-engineering" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors flex items-center gap-2 group">
                          <span className="w-1 h-1 rounded-full bg-[hsl(var(--muted-foreground))] group-hover:bg-[hsl(var(--primary))] transition-colors"></span>
                          Custom Design
                        </Link>
                      </li>
                      <li>
                        <Link to="/dashboard" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors flex items-center gap-2 group">
                          <span className="w-1 h-1 rounded-full bg-[hsl(var(--muted-foreground))] group-hover:bg-[hsl(var(--primary))] transition-colors"></span>
                          My Orders
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-[hsl(var(--primary))]" />
                  <h4 className="font-bold text-[hsl(var(--foreground))] tracking-wider uppercase text-xs">{isAdmin ? "System" : "Community"}</h4>
                </div>
                <ul className="space-y-3 text-sm">
                  {!isAdmin && (
                    <li>
                      <Link to="/community" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors flex items-center gap-2 group">
                        <span className="w-1 h-1 rounded-full bg-[hsl(var(--muted-foreground))] group-hover:bg-[hsl(var(--primary))] transition-colors"></span>
                        Locomotive Train
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link to="/support" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors flex items-center gap-2 group">
                      <span className="w-1 h-1 rounded-full bg-[hsl(var(--muted-foreground))] group-hover:bg-[hsl(var(--primary))] transition-colors"></span>
                      {isAdmin ? "Admin Support" : "Support"}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-[hsl(var(--border))] py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                &copy; {new Date().getFullYear()} <span className="font-semibold text-[hsl(var(--foreground))]">Locomotive</span>. Engineered with precision.
              </p>
              <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Non-logged-in footer
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
                <li><a href="/#faq" className="hover:text-[hsl(var(--primary))] transition">FAQ</a></li>
                <li><Link to="/support" className="hover:text-[hsl(var(--primary))] transition">Support</Link></li>
                <li><Link to="/community" className="hover:text-[hsl(var(--primary))] transition">Community</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-[hsl(var(--foreground))] tracking-wider uppercase text-sm">Legal</h4>
              <ul className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
                <li><span className="opacity-75">Terms of Service (coming soon)</span></li>
                <li><span className="opacity-75">Privacy Policy (coming soon)</span></li>
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
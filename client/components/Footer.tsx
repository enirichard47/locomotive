import { Link } from "react-router-dom";
import { Github, Twitter, Disc, ShoppingBag, ArrowRight } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

export default function Footer() {
  const { isConnected, isAdmin } = useWallet();
  
  const socialLinks = [
    { icon: Twitter, href: "#", name: "Twitter" },
    { icon: Github, href: "#", name: "GitHub" },
    { icon: Disc, href: "#", name: "Discord" },
  ];

  return (
    <footer className="bg-[hsl(var(--background))] border-t border-[hsl(var(--border))] pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Info */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-8">
              <span className="font-serif text-3xl tracking-tight text-[hsl(var(--foreground))]">
                LOCOMOTIVE
              </span>
            </Link>
            <p className="text-[hsl(var(--muted-foreground))] font-light leading-relaxed mb-8 max-w-xs">
              The manifestation of individual identity through premium silhouettes and artisanal engineering.
            </p>
            <div className="flex items-center gap-6">
              {socialLinks.map((link) => (
                <a key={link.name} href={link.href} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">
                  <span className="sr-only">{link.name}</span>
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-serif text-xl mb-8 italic">Platform</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/merch-designs" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors uppercase tracking-widest">
                  The Archive
                </Link>
              </li>
              <li>
                <Link to="/identity-engineering" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors uppercase tracking-widest">
                  The Studio
                </Link>
              </li>
              {isConnected && (
                <li>
                  <Link to="/dashboard" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors uppercase tracking-widest">
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-serif text-xl mb-8 italic">Resources</h4>
            <ul className="space-y-4">
              <li>
                <a href="/#faq" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors uppercase tracking-widest">
                  FAQ
                </a>
              </li>
              <li>
                <span className="text-sm text-[hsl(var(--muted-foreground))]/50 uppercase tracking-widest">
                  Brand Guidelines
                </span>
              </li>
              <li>
                <span className="text-sm text-[hsl(var(--muted-foreground))]/50 uppercase tracking-widest">
                  Support
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h4 className="font-serif text-xl mb-8 italic">Stay Connected</h4>
            <p className="text-sm text-[hsl(var(--muted-foreground))] font-light mb-6">
              Subscribe to receive updates on new drops and exclusive collections.
            </p>
            <form className="relative group">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS"
                className="w-full bg-transparent border-b border-[hsl(var(--border))] py-3 text-xs uppercase tracking-widest focus:outline-none focus:border-[hsl(var(--primary))] transition-colors"
              />
              <button className="absolute right-0 bottom-3 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors">
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-[hsl(var(--border))] flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} Locomotive. All rights reserved.
          </p>
          <div className="flex gap-10">
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]/50 uppercase tracking-[0.2em]">Privacy Policy</span>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]/50 uppercase tracking-[0.2em]">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
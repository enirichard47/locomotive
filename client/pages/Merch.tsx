import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import { useWallet } from "@/contexts/WalletContext";

export default function Merch() {
  const { isConnected } = useWallet();
  const collections = [
    {
      name: "Combat Collection",
      description: "Bold, aggressive streetwear with military-inspired aesthetics",
      icon: "🎖️",
      path: "/collections/combat",
    },
    {
      name: "8 Collection",
      description: "Minimalist designs with numeric symbolism",
      icon: "8️⃣",
      path: "/collections/8",
    },
    {
      name: "Oly Collection",
      description: "Classic, timeless pieces with heritage branding",
      icon: "🏛️",
      path: "/collections/oly",
    },
    {
      name: "Manga Collection",
      description: "Anime-inspired graphics and vibrant colors",
      icon: "📚",
      path: "/collections/manga",
    },
    {
      name: "Arsenal Collection",
      description: "Premium jerseys with statement designs",
      icon: "⚔️",
      path: "/collections/arsenal",
    },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-[hsl(var(--card))] to-[hsl(var(--background))] border-b border-[hsl(var(--border))] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-[hsl(var(--foreground))]">
            Merch Collections
          </h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))]">
            Explore our pre-designed Locomotive collections
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection, idx) => (
              <Link
                key={idx}
                to={collection.path}
                className="group bg-[hsl(var(--card))] rounded-xl overflow-hidden hover:shadow-lg hover:shadow-[hsl(var(--primary))]/20 transition border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]"
              >
                <div className="aspect-square bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--background))] flex items-center justify-center text-7xl group-hover:scale-110 transition">
                  {collection.icon}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">
                    {collection.description}
                  </p>
                  <div className="text-[hsl(var(--primary))] font-bold text-sm flex items-center gap-2 group-hover:translate-x-1 transition">
                    View Collection
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[hsl(var(--card))] to-[hsl(var(--background))] border-t border-[hsl(var(--border))] py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 text-[hsl(var(--foreground))]">
            Want Your Own Design?
          </h2>
          <p className="text-lg text-[hsl(var(--muted-foreground))] mb-8">
            {isConnected ? "Switch to Custom Made and design exactly what you want" : "Connect your wallet to start designing your own custom piece"}
          </p>
          <Link
            to="/custom-made"
            className="inline-flex items-center justify-center px-8 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] transition group shadow-lg shadow-[hsl(var(--primary))]/30"
          >
            {isConnected ? "Design Now" : "Design Now (Connect Wallet)"}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(var(--card))] border-t border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!isConnected && (
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded">
                    <span className="text-[hsl(var(--primary-foreground))] font-bold text-lg">⚡</span>
                  </div>
                  <span className="font-bold tracking-tight text-[hsl(var(--foreground))]">
                    LOCOMOTIVE
                  </span>
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  AI-powered custom streetwear design
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-[hsl(var(--foreground))]">Shop</h4>
                <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                  <li>
                    <Link to="/custom-made" className="hover:text-[hsl(var(--primary))] transition">
                      Custom Made
                    </Link>
                  </li>
                  <li>
                    <Link to="/merch" className="hover:text-[hsl(var(--primary))] transition">
                      Merch
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-[hsl(var(--foreground))]">Support</h4>
                <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                  <li>
                    <a href="#" className="hover:text-[hsl(var(--primary))] transition">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[hsl(var(--primary))] transition">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-[hsl(var(--foreground))]">Legal</h4>
                <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                  <li>
                    <a href="#" className="hover:text-[hsl(var(--primary))] transition">
                      Terms
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[hsl(var(--primary))] transition">
                      Privacy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          )}

          <div className={`border-t border-[hsl(var(--border))] pt-8 flex flex-col md:flex-row ${!isConnected ? "justify-between" : "justify-center"} items-center text-sm text-[hsl(var(--muted-foreground))]`}>
            <p>&copy; 2024 Locomotive Store. All rights reserved.</p>
            {!isConnected && <p>Powered by Grok AI</p>}
          </div>
        </div>
      </footer>
    </div>
  );
}

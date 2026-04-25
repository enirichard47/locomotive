import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import { useWallet } from "@/contexts/WalletContext";
import { getCollectionBySlug } from "../../lib/storefront";
import type { CollectionItem } from "../../lib/storefront";

export default function ArsenalCollection() {
  const { isConnected } = useWallet();
  const [collection, setCollection] = useState<CollectionItem | null>(null);

  useEffect(() => {
    let mounted = true;

    getCollectionBySlug("arsenal")
      .then((item) => {
        if (mounted) {
          setCollection(item);
        }
      })
      .catch(() => {
        if (mounted) {
          setCollection(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const collectionPrice = collection?.basePrice ?? 79.99;
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header />

      {/* Page Header */}
      <section className="relative min-h-[60vh] flex items-center justify-center border-b-2 border-[hsl(var(--border))] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--card))]/50 to-[hsl(var(--background))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,hsl(var(--background))_80%)]" />
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-20 left-20 w-24 h-24 border-2 border-red-500 rounded-2xl rotate-12 animate-pulse" />
          <div className="absolute bottom-20 right-20 w-32 h-32 border-2 border-[hsl(var(--primary))] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
              <span className="text-2xl">⚔️</span>
              <span className="text-sm font-bold text-red-500">PERFORMANCE SERIES</span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[hsl(var(--foreground))] via-red-500 to-orange-500 bg-clip-text text-transparent">
                Arsenal Collection
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto leading-relaxed">
              Premium jerseys with statement designs for the competitive spirit. Built for champions.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--card))]/50 backdrop-blur-sm border border-[hsl(var(--border))]">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="font-medium">Pro Performance</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--card))]/50 backdrop-blur-sm border border-[hsl(var(--border))]">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="font-medium">Limited Release</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Details */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
            <div>
              <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4">
                About This Collection
              </h2>
              <p className="text-[hsl(var(--muted-foreground))] leading-relaxed mb-6">
                The Arsenal Collection celebrates competition, strength, and prowess. Premium performance jerseys with bold statement designs. Built for those with the competitive spirit and the confidence to back it up. Limited quantities on every release.
              </p>
              <ul className="space-y-3">
                {[
                  "Performance jersey material",
                  "Bold statement graphics",
                  "Pro athlete inspired",
                  "Limited release drops",
                  "Premium construction",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-[hsl(var(--foreground))]"
                  >
                    <div className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--background))] rounded-xl border border-[hsl(var(--border))] aspect-square flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl mb-4">⚔️</div>
                <p className="text-[hsl(var(--muted-foreground))]">
                  Arsenal Collection Preview
                </p>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-8">
              Featured Items
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg overflow-hidden hover:border-[hsl(var(--primary))] transition group flex flex-col"
                >
                  <div className="aspect-square bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--background))] flex items-center justify-center group-hover:from-[hsl(var(--primary))]/20 transition">
                    <span className="text-6xl">👕</span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-[hsl(var(--foreground))] mb-2">
                      Arsenal Jersey {item}
                    </h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 flex-1">
                      Performance fit, breathable
                    </p>
                    <p className="text-[hsl(var(--primary))] font-bold mb-4">${collectionPrice.toFixed(2)}</p>
                    <Link
                      to={`/checkout?item=Arsenal+Jersey+${item}&collection=Arsenal&price=${collectionPrice}&icon=👕`}
                      className="w-full py-2 px-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] transition text-center"
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/custom-made"
              className="inline-flex items-center justify-center px-8 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] transition group"
            >
              Design Similar Piece
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              to="/merch"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-bold rounded-lg hover:border-[hsl(var(--primary))] transition"
            >
              Back to Merch
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] mt-20">
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

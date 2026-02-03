import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import { useWallet } from "@/contexts/WalletContext";

export default function EightCollection() {
  const { isConnected } = useWallet();
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header />

      {/* Page Header */}
      <section className="bg-gradient-to-r from-[hsl(var(--card))] to-[hsl(var(--background))] border-b border-[hsl(var(--border))] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">8️⃣</span>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-[hsl(var(--foreground))]">
                8 Collection
              </h1>
              <p className="text-[hsl(var(--muted-foreground))] mt-2">
                Minimalist designs with numeric symbolism and clean aesthetics
              </p>
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
                The 8 Collection embraces minimalism and numeric symbolism. Clean lines, subtle typography, and deliberate placements create pieces that make a statement through simplicity. Perfect for those who appreciate understated elegance.
              </p>
              <ul className="space-y-3">
                {[
                  "Minimalist design philosophy",
                  "Premium fabric selections",
                  "Subtle branding elements",
                  "Multiple sizing options",
                  "Versatile colorways",
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
                <div className="text-8xl mb-4">8️⃣</div>
                <p className="text-[hsl(var(--muted-foreground))]">
                  8 Collection Preview
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
                      8 Series #{item}
                    </h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4 flex-1">
                      Minimal design, premium fit
                    </p>
                    <p className="text-[hsl(var(--primary))] font-bold mb-4">$45.99</p>
                    <Link
                      to={`/checkout?item=8+Series+%23${item}&collection=8&price=45.99&icon=👕`}
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

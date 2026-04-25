import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCollectionBySlug } from "../../lib/storefront";
import type { CollectionItem } from "../../lib/storefront";

export default function HateCollection() {
  const [collection, setCollection] = useState<CollectionItem | null>(null);

  useEffect(() => {
    let mounted = true;

    getCollectionBySlug("hate")
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

  const collectionName = collection?.name || "Hate Collection";
  const collectionImage = collection?.image || "/hate.png";
  const collectionPrice = collection?.basePrice ?? 0.1;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header />

      {/* Page Header */}
      <section className="relative min-h-[60vh] flex items-center justify-center border-b-2 border-[hsl(var(--border))] overflow-hidden">
        {/* Background image with better overlay */}
        <div className="absolute inset-0">
          <img src={collectionImage} alt={collectionName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--background))]/95 via-[hsl(var(--background))]/90 to-[hsl(var(--background))]/95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,hsl(var(--background))_80%)]" />
        </div>
        
        {/* Floating geometric shapes */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-20 left-20 w-24 h-24 border-2 border-[hsl(var(--primary))] rounded-2xl rotate-12 animate-pulse" />
          <div className="absolute bottom-20 right-20 w-32 h-32 border-2 border-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
              <span className="text-sm font-bold text-red-500">LIMITED EDITION</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[hsl(var(--foreground))] via-red-500 to-orange-500 bg-clip-text text-transparent">
                {collectionName}
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto leading-relaxed">
              Bold identities meet unapologetic self-expression. Purpose-driven apparel for those who aren't afraid to stand out.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--card))]/50 backdrop-blur-sm border border-[hsl(var(--border))]">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="font-medium">Exclusive Design</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--card))]/50 backdrop-blur-sm border border-[hsl(var(--border))]">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="font-medium">In Stock</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Details */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4">
                About This Collection
              </h2>
              <p className="text-[hsl(var(--muted-foreground))] leading-relaxed mb-6">
                The "Hate" Collection represents bold identities and unapologetic self-expression. Purpose-driven apparel designed for those who aren't afraid to stand out. Limited edition releases crafted with precision and intention.
              </p>
              <ul className="space-y-3">
                {[
                  "Purpose-driven apparel",
                  "Limited edition releases",
                  "Identity-based AI design",
                  "High-quality fabric and print",
                  "Custom mission statement options",
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

            <div className="relative w-full aspect-square p-8 bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--background))] rounded-3xl overflow-hidden border border-[hsl(var(--border))]">
              <img src={collectionImage} alt="Hate collection preview" className="w-full h-full object-cover rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>

          {/* Products Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-8">
              Featured Items
            </h2>
            <div className="grid md:grid-cols-1 gap-6 max-w-md">
              <div className="group relative border border-[hsl(var(--border))] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[hsl(var(--primary))]/10">
                <div className="aspect-square bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--background))]">
                  <img src={collectionImage} alt="Hate Cap" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6 bg-[hsl(var(--card))]">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-[hsl(var(--foreground))] mb-1">
                        Hate Cap
                      </h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Full-color print, regular fit
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[hsl(var(--primary))]">${collectionPrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <Link
                    to={`/checkout?item=${encodeURIComponent("Hate Cap")}&collection=${encodeURIComponent("Hate")}&price=${collectionPrice}&image=${encodeURIComponent(collectionImage)}`}
                    className="mt-4 w-full py-3 px-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] transition text-center flex items-center justify-center gap-2"
                  >
                    Buy Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/identity-engineering"
              className="inline-flex items-center justify-center px-8 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] transition group"
            >
              Design Similar Piece
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              to="/merch-designs"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-bold rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10 transition"
            >
              Back to Merch
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

import { Link, useParams } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCollectionBySlug } from "../../lib/storefront";
import type { CollectionItem } from "../../lib/storefront";
import { useEffect, useState } from "react";
import { useRefetchOnFocus } from "@/hooks/use-refetch-on-focus";

export default function DynamicCollection() {
  const { slug } = useParams();
  const [collection, setCollection] = useState<CollectionItem | null>(null);
  const [isLoadingCollection, setIsLoadingCollection] = useState(true);

  useEffect(() => {
    let mounted = true;
    getCollectionBySlug(slug)
      .then((item) => {
        if (mounted) {
          setCollection(item);
        }
      })
      .catch(() => {
        if (mounted) {
          setCollection(null);
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoadingCollection(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  useRefetchOnFocus(() => {
    if (!slug) {
      return;
    }

    getCollectionBySlug(slug)
      .then((item) => setCollection(item))
      .catch(() => setCollection(null));
  });

  if (isLoadingCollection) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-10 text-center text-[hsl(var(--muted-foreground))]">
            Loading collection...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-10 text-center">
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-3">Collection Not Found</h1>
            <Link to="/merch-designs" className="inline-flex items-center px-6 py-3 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold">
              Back to Merch
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const accentLabel = collection.comingSoon ? "COMING SOON" : "LIMITED EDITION";
  const highlightText = collection.comingSoon
    ? "A new collection is on the way."
    : "Freshly curated for the storefront.";
  const featuredItems = collection.featuredItems.length > 0
    ? collection.featuredItems
    : [
        {
          id: `fallback-${collection.id}`,
          name: collection.name,
          description: collection.comingSoon
            ? "Launch preview"
            : "Signature release",
          image: collection.image,
          price: collection.basePrice,
        },
      ];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header />

      <main>
        <section className="relative min-h-[60vh] flex items-center justify-center border-b-2 border-[hsl(var(--border))] overflow-hidden">
          <div className="absolute inset-0">
            <img src={collection.image} alt={collection.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--background))]/95 via-[hsl(var(--background))]/88 to-[hsl(var(--background))]/96" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,hsl(var(--background))_80%)]" />
          </div>

          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute top-20 left-20 w-24 h-24 border-2 border-[hsl(var(--primary))] rounded-2xl rotate-12 animate-pulse" />
            <div className="absolute bottom-20 right-20 w-32 h-32 border-2 border-red-500 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-red-500" />
                <span className="text-sm font-bold text-red-500">{accentLabel}</span>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[hsl(var(--foreground))]">Embody Your Brand</h2>
                <p className="text-base sm:text-lg text-[hsl(var(--muted-foreground))]">Live your purpose</p>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-[hsl(var(--foreground))] via-red-500 to-orange-500 bg-clip-text text-transparent">
                  {collection.name}
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto leading-relaxed">
                {collection.description}
              </p>

              <div className="flex items-center justify-center gap-2 text-sm">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--card))]/50 backdrop-blur-sm border border-[hsl(var(--border))]">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-medium">{highlightText}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--card))]/50 backdrop-blur-sm border border-[hsl(var(--border))]">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="font-medium">50% Presale Discount</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/70 px-5 py-3 backdrop-blur-sm">
                <span className="text-sm text-[hsl(var(--muted-foreground))] line-through">$22.00</span>
                <span className="text-2xl font-extrabold text-[hsl(var(--primary))]">${collection.basePrice.toFixed(2)}</span>
                <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">Presale price</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4">
                  About This Collection
                </h2>
                <p className="text-[hsl(var(--muted-foreground))] leading-relaxed mb-6">
                  {collection.description}
                </p>
                <ul className="space-y-3">
                  {[
                    "Editorial-style presentation",
                    "Premium fabric and print direction",
                    "Built for bold storefront launches",
                    collection.comingSoon ? "Release date coming soon" : "Available now for checkout",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-[hsl(var(--foreground))]">
                      <div className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative w-full aspect-square p-8 bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--background))] rounded-3xl overflow-hidden border border-[hsl(var(--border))]">
                <img src={collection.image} alt={collection.name} className="w-full h-full object-cover rounded-2xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>

            <div className="mb-16">
              <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-8">
                Featured Items
              </h2>
              <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
                {featuredItems.map((item) => (
                  <div key={item.id} className="group relative min-w-[18rem] max-w-[18rem] shrink-0 snap-start border border-[hsl(var(--border))] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[hsl(var(--primary))]/10">
                    <div className="aspect-square bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--background))]">
                      <img src={item.image || collection.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-6 bg-[hsl(var(--card))] space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-bold text-lg text-[hsl(var(--foreground))] mb-1">{item.name}</h3>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            {item.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-[hsl(var(--muted-foreground))] line-through">${((collection.basePrice ?? item.price) * 2).toFixed(2)}</div>
                          <p className="text-lg font-bold text-[hsl(var(--primary))]">${item.price.toFixed(2)}</p>
                        </div>
                      </div>
                      {!collection.comingSoon && (
                        <Link
                          to={`/checkout?item=${encodeURIComponent(item.name)}&collection=${encodeURIComponent(collection.name)}&price=${item.price}&image=${encodeURIComponent(item.image || collection.image)}`}
                          className="w-full py-3 px-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] transition text-center flex items-center justify-center gap-2"
                        >
                          Buy Now
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!collection.comingSoon && (
                <Link
                  to={`/checkout?item=${encodeURIComponent(collection.name)}&collection=${encodeURIComponent(
                    collection.name,
                  )}&price=${collection.basePrice}&image=${encodeURIComponent(collection.image)}`}
                  className="inline-flex items-center justify-center px-8 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] transition group"
                >
                  Buy Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                </Link>
              )}
              <Link
                to="/merch-designs"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-bold rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10 transition"
              >
                Back to Merch
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

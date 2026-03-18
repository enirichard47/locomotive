import { Link, useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getCollectionBySlug } from "../../lib/storefront";
import type { CollectionItem } from "../../lib/storefront";
import { useEffect, useState } from "react";

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

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="rounded-2xl overflow-hidden border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <img src={collection.image} alt={collection.name} className="w-full h-full object-cover aspect-[4/3]" />
          </div>

          <div>
            <p className="text-sm uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">Collection</p>
            <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-4">{collection.name}</h1>
            <p className="text-[hsl(var(--muted-foreground))] mb-6">{collection.description}</p>

            {collection.comingSoon ? (
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/30 font-semibold">
                Coming Soon
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  Starting at ${collection.basePrice.toFixed(2)}
                </p>
                <Link
                  to={`/checkout?item=${encodeURIComponent(collection.name)}&collection=${encodeURIComponent(
                    collection.name,
                  )}&price=${collection.basePrice}&image=${encodeURIComponent(collection.image)}`}
                  className="inline-flex items-center px-8 py-3 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold hover:bg-[hsl(130_99%_60%)] transition"
                >
                  Buy Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

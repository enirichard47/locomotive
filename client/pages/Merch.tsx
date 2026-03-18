import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, Shirt, Package, Palette, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import { useWallet } from "@/contexts/WalletContext";
import Footer from "@/components/Footer";
import { getAllCollections } from "../lib/storefront";
import type { CollectionItem } from "../lib/storefront";

export default function Merch() {
  const { isConnected } = useWallet();
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState<"all" | "ready" | "soon">("all");
  const [sort, setSort] = useState<"featured" | "price-low" | "price-high">("featured");

  useEffect(() => {
    let mounted = true;
    getAllCollections()
      .then((items) => {
        if (mounted) {
          setCollections(items);
        }
      })
      .catch(() => {
        if (mounted) {
          setCollections([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoadingCollections(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredCollections = useMemo(() => {
    let list = collections.filter((item) => {
      const query = search.trim().toLowerCase();
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      const matchesAvailability =
        availability === "all" ||
        (availability === "ready" && !item.comingSoon) ||
        (availability === "soon" && item.comingSoon);

      return matchesQuery && matchesAvailability;
    });

    if (sort === "price-low") {
      list = [...list].sort((a, b) => a.basePrice - b.basePrice);
    }

    if (sort === "price-high") {
      list = [...list].sort((a, b) => b.basePrice - a.basePrice);
    }

    return list;
  }, [availability, collections, search, sort]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header />

      {/* Page Header */}
      <section className="relative border-b-2 border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--card))]/50 to-[hsl(var(--background))] overflow-hidden">
        {/* Geometric background patterns */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-32 h-32 border-2 border-[hsl(var(--primary))] rounded-2xl rotate-12" />
            <div className="absolute bottom-20 right-20 w-40 h-40 border-2 border-purple-500 rounded-full" />
            <div className="absolute top-1/3 right-1/4 w-24 h-24 border-2 border-blue-500 rounded-2xl -rotate-12" />
          </div>
        </div>
        
        {/* Gradient blurs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[hsl(var(--primary))]/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[hsl(var(--primary))]/10 to-purple-500/10 border border-[hsl(var(--primary))]/20 backdrop-blur-sm">
              <Shirt className="w-4 h-4 text-[hsl(var(--primary))]" />
              <span className="text-sm font-semibold bg-gradient-to-r from-[hsl(var(--primary))] to-purple-600 bg-clip-text text-transparent">Limited Edition Drops</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[hsl(var(--foreground))] via-[hsl(var(--primary))] to-purple-600 bg-clip-text text-transparent">
                Exclusive Merch
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-[hsl(var(--muted-foreground))] max-w-3xl mx-auto leading-relaxed">
              Curated, limited-edition collections engineered for bold identities and unapologetic self-expression. Each piece tells a story.
            </p>
            
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                <Package className="w-4 h-4 text-[hsl(var(--primary))]" />
                <span className="text-sm font-medium">{collections.length} Collections</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                <Palette className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Premium Quality</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoadingCollections && (
            <div className="mb-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm text-[hsl(var(--muted-foreground))]">
              Loading collections...
            </div>
          )}

          <div className="mb-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 grid lg:grid-cols-3 gap-4">
            <label className="space-y-2">
              <span className="text-sm text-[hsl(var(--muted-foreground))]">Search Collection</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or vibe"
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm text-[hsl(var(--muted-foreground))]">Availability</span>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as "all" | "ready" | "soon")}
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2"
              >
                <option value="all">All</option>
                <option value="ready">Available now</option>
                <option value="soon">Coming soon</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm text-[hsl(var(--muted-foreground))]">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as "featured" | "price-low" | "price-high")}
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {filteredCollections.map((collection, idx) => (
              collection.comingSoon ? (
                <div
                  key={idx}
                  aria-disabled="true"
                  className="group relative overflow-hidden rounded-2xl aspect-[4/3] border border-[hsl(var(--border))] opacity-90 cursor-not-allowed"
                >
                  <img
                    src={collection.image}
                    alt={`${collection.name} preview`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                  <div className="relative h-full flex flex-col justify-end p-8">
                    <span className="inline-flex w-fit items-center mb-3 px-3 py-1 text-xs font-bold tracking-wide rounded-full bg-orange-500/20 text-orange-200 border border-orange-300/40 uppercase">
                      Coming Soon
                    </span>
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {collection.name}
                    </h3>
                    <p className="text-white/80 text-sm mb-4">
                      {collection.description}
                    </p>
                    <div className="flex items-center text-orange-200 font-bold">
                      <span>Not Yet Available</span>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={idx}
                  to={collection.path}
                  className="group relative overflow-hidden rounded-2xl aspect-[4/3] border border-[hsl(var(--border))] transition-all duration-300 hover:shadow-xl hover:shadow-[hsl(var(--primary))]/10"
                >
                  <img
                    src={collection.image}
                    alt={`${collection.name} preview`}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                  <div className="relative h-full flex flex-col justify-end p-8">
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {collection.name}
                    </h3>
                    <p className="text-white/80 text-sm mb-4">
                      {collection.description}
                    </p>
                    <div className="flex items-center text-[hsl(var(--primary))] font-bold group-hover:translate-x-1 transition-transform">
                      <span>View Collection</span>
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </div>
                </Link>
              )
            ))}
          </div>
          {filteredCollections.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-[hsl(var(--border))] p-8 text-center text-[hsl(var(--muted-foreground))]">
              No collection matched your search. Try different keywords or reset filters.
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl p-8 md:p-16 text-center overflow-hidden bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,hsl(var(--primary)/0.1),transparent_40%)] animate-[spin_20s_linear_infinite]" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 text-[hsl(var(--foreground))]">
                Want Your Own Design?
              </h2>
              <p className="text-xl text-[hsl(var(--muted-foreground))] mb-8 max-w-2xl mx-auto">
                {isConnected ? "Switch to Identity Engineering and design exactly what you want." : "Connect your wallet to start designing your own custom piece."}
              </p>
              <Link
                to="/identity-engineering"
                className="inline-flex items-center justify-center px-10 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] hover:shadow-lg hover:shadow-[hsl(var(--primary))]/50 transition group text-lg"
              >
                {isConnected ? "Start Engineering" : "Connect to Design"}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

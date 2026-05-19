import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, Shirt, Package, Palette, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { useWallet } from "@/contexts/WalletContext";
import Footer from "@/components/Footer";
import { getAllCollections } from "../lib/storefront";
import type { CollectionItem } from "../lib/storefront";
import { useRefetchOnFocus } from "@/hooks/use-refetch-on-focus";

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

  useRefetchOnFocus(() => {
    getAllCollections()
      .then((items) => setCollections(items))
      .catch(() => setCollections([]));
  });

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
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Editorial Header */}
        <section className="relative pt-40 pb-32 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-center relative z-10"
              >
                <div className="inline-flex items-center gap-4 mb-12">
                  <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-red-600">The Full Store</span>
                  <div className="w-12 h-[1px] bg-red-600/30" />
                </div>
                
                <h1 className="font-serif text-5xl xs:text-6xl sm:text-[10vw] font-normal leading-[0.85] tracking-tighter uppercase text-black mb-16">
                  Signature <br />
                  <span className="italic text-gray-600 font-light pr-4">Archive</span>
                </h1>
                
                <div className="max-w-xl mx-auto border-l border-gray-300 pl-12 py-4 text-left mb-20">
                  <p className="text-xl sm:text-2xl text-gray-600 font-serif italic leading-relaxed">
                    "Explore our curated seasonal designs, crafted for quality and style. A history of premium custom apparel."
                  </p>
                </div>
                
                <div className="flex items-center justify-center gap-20">
                  <div className="text-center group">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-2 group-hover:text-red-600 transition-colors">Collections</span>
                    <span className="font-serif text-5xl italic text-black tracking-tighter">{collections.length}</span>
                  </div>
                  <div className="w-[1px] h-16 bg-gray-300 rotate-12" />
                  <div className="text-center group">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-2 group-hover:text-red-600 transition-colors">Status</span>
                    <span className="font-serif text-5xl italic text-black tracking-tighter">Active</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Subtle background text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02] whitespace-nowrap">
            <span className="text-[30vw] font-serif font-black uppercase italic tracking-tighter select-none">DROPS</span>
          </div>
        </section>

        {/* Minimalist Filters */}
        <section className="sticky top-20 z-40 bg-white/80 backdrop-blur-xl border-y border-gray-300 py-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-black transition-colors" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Find a collection..."
                  className="w-full bg-transparent border-none pl-8 py-2 text-sm font-serif italic focus:ring-0 placeholder:text-gray-500"
                />
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Availability</span>
                  <div className="flex gap-4">
                    {["all", "ready", "soon"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setAvailability(opt as any)}
                        className={`text-[10px] font-bold uppercase tracking-widest transition-all ${availability === opt ? "text-red-600 underline underline-offset-4" : "text-gray-400 hover:text-black"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="w-[1px] h-4 bg-gray-300" />
                
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                  className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-black focus:ring-0 cursor-pointer"
                >
                  <option value="featured">Featured Order</option>
                  <option value="price-low">Lowest Price</option>
                  <option value="price-high">Highest Price</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Collections Staggered Grid */}
        <section className="py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {isLoadingCollections && (
              <div className="col-span-full flex flex-col items-center justify-center py-40 gap-6">
                <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <p className="font-serif text-sm uppercase tracking-[0.3em] text-gray-400 animate-pulse">Loading Collections...</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-x-24 gap-y-40">
              {filteredCollections.map((collection, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: (idx % 2) * 0.2 }}
                  className={`group relative ${idx % 2 === 1 ? "md:mt-40" : ""}`}
                >
                  {collection.comingSoon ? (
                    <div className="block relative aspect-[3/4] overflow-hidden bg-gray-50 mb-10 cursor-default">
                      <img
                        src={collection.image}
                        alt={collection.name}
                        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ${collection.comingSoon ? "grayscale" : ""}`}
                      />
                      <div className="absolute inset-0 bg-black/5" />
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="px-8 py-3 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-[0.4em] text-orange-600">
                          Coming Soon
                        </span>
                      </div>
                    </div>
                  ) : (
                    <Link to={collection.path} className="block relative aspect-[3/4] overflow-hidden bg-gray-50 mb-10">
                      <img
                        src={collection.image}
                        alt={collection.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                    </Link>
                  )}

                  <div className="relative border-l border-gray-300 pl-8">
                    <div className="flex justify-between items-baseline mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-red-600 block">
                        Release {idx + 1}
                      </span>
                      <span className="text-[9px] font-slab uppercase tracking-[0.2em] text-gray-400">
                        Embody Your Brand
                      </span>
                    </div>
                    {collection.comingSoon ? (
                      <div className="block cursor-default">
                        <h3 className="font-serif text-3xl sm:text-5xl text-gray-400 mb-4">
                          {collection.name}
                        </h3>
                      </div>
                    ) : (
                      <Link to={collection.path} className="block group/title">
                        <h3 className="font-serif text-3xl sm:text-5xl text-black mb-4 group-hover/title:italic transition-all">
                          {collection.name}
                        </h3>
                      </Link>
                    )}
                    <p className="text-gray-600 font-serif italic text-lg leading-relaxed mb-8 max-w-sm">
                      "{collection.description}"
                    </p>
                    
                    <div className="flex items-center gap-8">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-black">
                        {collection.featuredItems.length} Items
                      </div>
                      <div className="w-8 h-[1px] bg-gray-300" />
                      {collection.comingSoon ? (
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 cursor-default">
                          Launching soon
                        </span>
                      ) : (
                        <Link to={collection.path} className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 hover:text-red-600 transition-colors">
                          View Collection
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredCollections.length === 0 && !isLoadingCollections && (
              <div className="py-40 text-center">
                <p className="font-serif italic text-2xl text-gray-500">"No collections found matching your criteria."</p>
              </div>
            )}
          </div>
        </section>

        {/* Global CTA */}
        <section className="py-40 bg-black text-white overflow-hidden relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-red-600 mb-12">The Studio</span>
              <h2 className="font-serif text-4xl sm:text-[10vw] font-normal leading-none tracking-tighter uppercase mb-16">
                Custom <br />
                <span className="italic text-red-600">Designs</span>
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-8">
                <Link
                  to="/identity-engineering"
                  className="px-12 py-5 bg-white text-black font-bold text-xs uppercase tracking-[0.5em] hover:bg-red-600 hover:text-white transition-all duration-500"
                >
                  Customize Now
                </Link>
                <Link
                  to="/"
                  className="px-12 py-5 border border-white/20 text-white font-bold text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all duration-500"
                >
                  Return Home
                </Link>
              </div>
            </div>
          </div>
          
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-red-600/20 blur-[120px]" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

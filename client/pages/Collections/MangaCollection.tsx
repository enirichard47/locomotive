import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { buildCheckoutUrl } from "@/lib/checkout";
import { getDefaultFeaturedItems } from "@shared/collections";
import type { CollectionItem } from "../../lib/storefront";
import { useRefetchOnFocus } from "@/hooks/use-refetch-on-focus";
import { useCollectionBySlug } from "@/hooks/use-collections";

export default function MangaCollection() {
  const { data: collection, refetch } = useCollectionBySlug("manga");

  useRefetchOnFocus(() => {
    void refetch();
  });

  if (!collection) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const collectionName = collection?.name || "Manga Collection";
  const collectionImage = collection?.image || "/locomotive_logo.jpeg";
  const collectionPrice = collection?.basePrice ?? 54.99;
  const featuredItems = collection?.featuredItems?.length ? collection.featuredItems : getDefaultFeaturedItems("manga");

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />

      <main>
        {/* Editorial Hero */}
        <section className="relative pt-40 pb-32 overflow-hidden bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="text-center relative z-10"
              >
                <div className="inline-flex items-center gap-4 mb-12">
                  <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-orange-600">The Graphic Series</span>
                  <div className="w-12 h-[1px] bg-orange-600/30" />
                </div>
                
                <h1 className="text-[8vw] sm:text-[6vw] font-normal leading-[0.95] tracking-tighter uppercase text-black mb-16">
                  <span className="font-slab">Embody Your Brand</span> <br />
                  <span className="text-[3vw] sm:text-[2.5vw] text-gray-400 block font-light tracking-[0.3em] uppercase mt-4 mb-2 font-serif">with</span>
                  <span className="italic text-orange-600 font-light pr-4 font-serif">Manga Archive</span>
                </h1>
                
                <div className="max-w-xl mx-auto border-l border-gray-300 pl-12 py-4 text-left mb-20">
                  <p className="text-xl sm:text-2xl text-gray-600 font-serif italic leading-relaxed">
                    "Step into the future of graphic apparel. Curated manga-inspired designs engineered with meticulous attention to line, silhouette, and story."
                  </p>
                </div>
                
                <div className="flex items-center justify-center gap-20">
                  <div className="text-center group">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-2 group-hover:text-orange-600 transition-colors">Status</span>
                    <span className="font-serif text-5xl italic text-black tracking-tighter">Coming Soon</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Subtle background text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02] whitespace-nowrap">
            <span className="text-[30vw] font-serif font-black uppercase italic tracking-tighter select-none">MANGA</span>
          </div>
        </section>

        {/* Collection Notification */}
        {collection && (
          <div className="container mx-auto px-4 mb-24">
            <motion.div 
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className={`max-w-5xl mx-auto rounded-full border px-8 py-3 text-center text-xs font-bold uppercase tracking-widest ${
                collection.comingSoon 
                  ? "border-orange-50 bg-orange-50/30 text-orange-800/60" 
                  : "border-orange-50 bg-orange-50/30 text-orange-800/60"
              }`}
            >
              {collection.comingSoon 
                ? "The Manga Collection is currently being designed. Launching soon." 
                : "Collection Open — Limited time pricing in effect."}
            </motion.div>
          </div>
        )}

        {/* Editorial Body Section */}
        <section className="py-32 bg-gray-50/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
              >
                <h2 className="font-serif text-5xl sm:text-6xl text-black mb-8 leading-tight">
                  Visual <br />
                  <span className="italic font-light text-orange-600">Energy</span>
                </h2>
                <p className="text-xl text-gray-700 font-serif leading-relaxed mb-10 italic">
                  Inspired by classic manga layouts, stark contrast and powerful illustrations. The "Manga" collection blends high-fidelity visuals with elite garment weights.
                </p>
                
                <div className="space-y-6">
                  {[
                    "Hand-drawn artisanal graphic curation",
                    "Heavyweight premium materials",              
                    "Contrast screen-print engineering",
                    "Unique localized series labeling",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-6 group">
                      <div className="w-1.5 h-1.5 bg-orange-600 rounded-full group-hover:scale-150 transition-transform" />
                      <span className="text-sm font-bold uppercase tracking-[0.2em] text-black/60 group-hover:text-black transition-colors">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2 }}
                className="relative"
              >
                <div className="aspect-[4/5] bg-white p-4 border border-gray-300 shadow-2xl relative z-10 overflow-hidden rounded-sm">
                  <img src={collectionImage} alt="Manga collection preview" className="w-full h-full object-cover" />
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-12 -right-12 w-64 h-64 border border-orange-100 rounded-full pointer-events-none -z-0" />
                <div className="absolute -bottom-8 -left-8 font-serif text-9xl text-orange-600/5 italic pointer-events-none select-none uppercase">MANGA</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Product Selection */}
        <section className="py-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
              <div className="max-w-2xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-orange-600 mb-4 block">The Selection</span>
                <h2 className="font-serif text-6xl sm:text-7xl text-black leading-none uppercase tracking-tighter">
                  Featured <br />
                  <span className="italic font-light">Items</span>
                </h2>
              </div>
              <p className="text-gray-600 font-serif italic max-w-sm text-right">
                Explore our graphic narratives, curated for visual distinction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
              {featuredItems.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  className="group"
                >
                  <div className="relative block aspect-[3/4] mb-10 overflow-hidden bg-gray-50">
                    <img src={item.image || collectionImage} alt={item.name} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  </div>

                  <div className="flex flex-col border-t border-gray-300 pt-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="max-w-[60%]">
                         <h3 className="font-serif text-2xl text-black mb-1 italic">
                          {item.name}
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          Limited Edition / Series
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-sm border border-orange-100 font-bold">
                          TBA
                        </span>
                      </div>
                    </div>
                    
                    <button
                      disabled
                      className="w-full py-4 bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em] text-center rounded-sm border border-gray-200/60 cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Global CTA */}
        <section className="py-40 bg-black text-white overflow-hidden relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col items-center text-center">
              <h2 className="font-serif text-7xl sm:text-[10vw] font-normal leading-none tracking-tighter uppercase mb-16">
                Choose Your <br />
                <span className="italic text-orange-600">Style</span>
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-8">
                <Link
                  to="/identity-engineering"
                  className="px-12 py-5 bg-white text-black font-bold text-xs uppercase tracking-[0.5em] hover:bg-orange-600 hover:text-white transition-all duration-500"
                >
                  Custom Design
                </Link>
                <Link
                  to="/merch-designs"
                  className="px-12 py-5 border border-white/20 text-white font-bold text-xs uppercase tracking-[0.5em] hover:bg-white hover:text-black transition-all duration-500"
                >
                  Full Store
                </Link>
              </div>
            </div>
          </div>
          
          {/* Abstract background elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-600/10 blur-[120px] -z-0 opacity-50" />
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gray-900/50 -z-0" />
        </section>
      </main>

      <Footer />
    </div>
  );
}

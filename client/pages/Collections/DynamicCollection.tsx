import { Link, useParams } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { buildCheckoutUrl } from "@/lib/checkout";
import type { CollectionItem } from "../../lib/storefront";
import { useRefetchOnFocus } from "@/hooks/use-refetch-on-focus";
import { useCollectionBySlug } from "@/hooks/use-collections";

export default function DynamicCollection() {
  const { slug } = useParams();
  const { data: collection, isLoading: isLoadingCollection, refetch } = useCollectionBySlug(slug);

  useRefetchOnFocus(() => {
    void refetch();
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
                  <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-[hsl(var(--primary))]">{accentLabel}</span>
                  <div className="w-12 h-[1px] bg-[hsl(var(--primary))]/30" />
                </div>
                
                <h1 className="text-4xl xs:text-5xl sm:text-[6vw] font-normal leading-[0.95] tracking-tighter uppercase text-black mb-16">
                  <span className="font-slab">Embody Your Brand</span> <br />
                  <span className="text-xl sm:text-[2.5vw] text-gray-400 block font-light tracking-[0.3em] uppercase mt-4 mb-2 font-serif">with</span>
                  <span className="italic text-[hsl(var(--primary))] font-light pr-4 font-serif">{collection.name}</span>
                </h1>
                
                <div className="max-w-xl mx-auto border-l border-gray-300 pl-12 py-4 text-left mb-20">
                  <p className="text-xl sm:text-2xl text-gray-600 font-serif italic leading-relaxed">
                    "{collection.description}"
                  </p>
                </div>
                
                <div className="flex items-center justify-center gap-20">
                  {collection.comingSoon ? (
                    <div className="text-center group">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-2 group-hover:text-[hsl(var(--primary))] transition-colors">Status</span>
                      <span className="font-serif text-5xl italic text-black tracking-tighter">Coming Soon</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-center group">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-2 group-hover:text-[hsl(var(--primary))] transition-colors">Sale Price</span>
                        <span className="font-serif text-5xl italic text-black tracking-tighter">${(collection.basePrice ?? 0).toFixed(0)}</span>
                      </div>
                      <div className="w-[1px] h-16 bg-gray-300 rotate-12" />
                      <div className="text-center group">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-2 group-hover:text-[hsl(var(--primary))] transition-colors">Status</span>
                        <span className="font-serif text-5xl italic text-black tracking-tighter">Available</span>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Subtle background text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02] whitespace-nowrap">
            <span className="text-[30vw] font-serif font-black uppercase italic tracking-tighter select-none">{collection.name.split(' ')[0]}</span>
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
              className="max-w-5xl mx-auto rounded-full border border-[hsl(var(--primary))]/10 bg-[hsl(var(--primary))]/5 px-8 py-3 text-center text-[hsl(var(--primary))]/60 text-xs font-bold uppercase tracking-widest"
            >
              {collection.comingSoon 
                ? "This collection is currently being designed. Launching soon." 
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
                <h2 className="font-serif text-3xl sm:text-6xl text-black mb-8 leading-tight">
                  About <br />
                  <span className="italic font-light text-[hsl(var(--primary))]">{collection.name}</span>
                </h2>
                 <p className="text-xl text-gray-700 font-serif leading-relaxed mb-10 italic">
                  {collection.description}
                </p>
                
                <div className="space-y-6">
                  {[
                    "Premium fabric and print quality",
                    "Signature architectural silhouettes",
                    "Designed for those who stand out",
                    collection.comingSoon ? "Release date coming soon" : "Available now for purchase",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-6 group">
                      <div className="w-1.5 h-1.5 bg-[hsl(var(--primary))] rounded-full group-hover:scale-150 transition-transform" />
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
                  <img src={collection.image} alt={collection.name} className="w-full h-full object-cover" />
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-12 -right-12 w-64 h-64 border border-[hsl(var(--primary))]/10 rounded-full pointer-events-none -z-0" />
                <div className="absolute -bottom-8 -left-8 font-serif text-9xl text-[hsl(var(--primary))]/5 italic pointer-events-none select-none uppercase">{slug}</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Product Selection */}
        <section className="py-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
              <div className="max-w-2xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[hsl(var(--primary))] mb-4 block">The Selection</span>
                <h2 className="font-serif text-4xl sm:text-7xl text-black leading-none uppercase tracking-tighter">
                  Featured <br />
                  <span className="italic font-light">Items</span>
                </h2>
              </div>
              <p className="text-gray-600 font-serif italic max-w-sm text-right">
                Curated seasonal designs, made for the bold and the unique.
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
                  <Link 
                    to={buildCheckoutUrl({
                      item: item.name,
                      collection: collection.name,
                      price: item.price,
                      image: item.image || collection.image,
                    })}
                    className="relative block aspect-[3/4] mb-10 overflow-hidden bg-gray-50"
                  >
                    <img src={item.image || collection.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                  </Link>

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
                        {collection.comingSoon ? (
                          <span className="font-mono text-xs uppercase tracking-widest text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 px-3 py-1 rounded-sm border border-[hsl(var(--primary))]/10 font-bold">
                            TBA
                          </span>
                        ) : (
                          <>
                            <p className="font-serif text-2xl text-black tracking-tighter mb-1">${item.price.toFixed(0)}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--primary))]/50 line-through">
                              ${(item.price * 2).toFixed(0)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {collection.comingSoon ? (
                      <button
                        disabled
                        className="w-full py-4 bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em] text-center rounded-sm border border-gray-200/60 cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    ) : (
                      <Link
                        to={buildCheckoutUrl({
                          item: item.name,
                          collection: collection.name,
                          price: item.price,
                          image: item.image || collection.image,
                        })}
                        className="w-full py-4 bg-black text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[hsl(var(--primary))] transition-all duration-500 text-center rounded-sm shadow-sm"
                      >
                        Buy Now
                      </Link>
                    )}
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
              <h2 className="font-serif text-4xl sm:text-[10vw] font-normal leading-none tracking-tighter uppercase mb-16">
                Choose Your <br />
                <span className="italic text-[hsl(var(--primary))]">Style</span>
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-8">
                <Link
                  to="/identity-engineering"
                  className="px-12 py-5 bg-white text-black font-bold text-xs uppercase tracking-[0.5em] hover:bg-[hsl(var(--primary))] hover:text-white transition-all duration-500"
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
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[hsl(var(--primary))]/10 blur-[120px] -z-0 opacity-50" />
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gray-900/50 -z-0" />
        </section>
      </main>

      <Footer />
    </div>
  );
}

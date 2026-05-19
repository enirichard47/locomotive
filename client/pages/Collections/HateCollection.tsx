import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { buildCheckoutUrl } from "@/lib/checkout";
import type { CollectionItem } from "../../lib/storefront";
import { useRefetchOnFocus } from "@/hooks/use-refetch-on-focus";
import { useCollectionBySlug } from "@/hooks/use-collections";

export default function HateCollection() {
  const { data: collection, refetch } = useCollectionBySlug("hate");

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

  const collectionName = collection?.name || "Hate Collection";
  const collectionImage = collection?.image || "/hate.png";
  const collectionPrice = collection?.basePrice ?? 22;
  const featuredItems = collection?.featuredItems || [];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Editorial Hero */}
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
                  <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-red-600">The Signature Series</span>
                  <div className="w-12 h-[1px] bg-red-600/30" />
                </div>
                
                <h1 className="text-4xl xs:text-5xl sm:text-[6vw] font-normal leading-[0.95] tracking-tighter uppercase text-black mb-16">
                  <span className="font-slab">Embody Your Brand</span> <br />
                  <span className="text-xl sm:text-[2.5vw] text-gray-400 block font-light tracking-[0.3em] uppercase mt-4 mb-2 font-serif">with</span>
                  <span className="italic text-red-600 font-light pr-4 font-serif">Pure Identity</span>
                </h1>
                
                 <div className="max-w-xl mx-auto border-l border-gray-300 pl-12 py-4 text-left mb-20">
                  <p className="text-xl sm:text-2xl text-gray-600 font-serif italic leading-relaxed">
                    "A statement of unapologetic self-expression. Designed for those who command their own story and show their own truth."
                  </p>
                </div>
                
                <div className="flex items-center justify-center gap-20">
                  <div className="text-center group">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-2 group-hover:text-red-600 transition-colors">Sale Price</span>
                    <span className="font-serif text-5xl italic text-black tracking-tighter">${(collectionPrice ?? 0).toFixed(0)}</span>
                  </div>
                  <div className="w-[1px] h-16 bg-gray-300 rotate-12" />
                  <div className="text-center group">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-2 group-hover:text-red-600 transition-colors">Status</span>
                    <span className="font-serif text-5xl italic text-black tracking-tighter">Available</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Subtle background text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02] whitespace-nowrap">
            <span className="text-[30vw] font-serif font-black uppercase italic tracking-tighter select-none">HATE</span>
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
              className="max-w-5xl mx-auto rounded-full border border-red-50 bg-red-50/30 px-8 py-3 text-center text-red-800/60 text-xs font-bold uppercase tracking-widest"
            >
              Collection Open — Limited time pricing in effect.
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
                  The Art of <br />
                  <span className="italic font-light">Self Expression</span>
                </h2>
                 <p className="text-xl text-gray-700 font-serif leading-relaxed mb-10 italic">
                  The "Hate" Collection represents bold identities and unapologetic self-expression. Purpose-driven apparel designed for those who aren't afraid to stand out.
                </p>
                
                <div className="space-y-6">
                  {[
                    "Premium fabric engineering",
                    "Signature anatomical silhouettes",              
                    "High-quality industrial textures",
                    "Custom mission statement options",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-6 group">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full group-hover:scale-150 transition-transform" />
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
                  <img src={collectionImage} alt="Hate collection preview" className="w-full h-full object-cover" />
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-12 -right-12 w-64 h-64 border border-red-100 rounded-full pointer-events-none -z-0" />
                <div className="absolute -bottom-8 -left-8 font-serif text-9xl text-red-600/5 italic pointer-events-none select-none">HATE</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Product Selection */}
        <section className="py-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
              <div className="max-w-2xl">
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-red-600 mb-4 block">The Selection</span>
                <h2 className="font-serif text-4xl sm:text-7xl text-black leading-none uppercase tracking-tighter">
                  Featured <br />
                  <span className="italic font-light">Items</span>
                </h2>
              </div>
              <p className="text-gray-600 font-serif italic max-w-sm text-right">
                Explore our latest designs, curated for those who wear their brand with pride.
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
                      collection: "Hate",
                      price: item.price,
                      image: item.image,
                    })}
                    className="relative block aspect-[3/4] mb-10 overflow-hidden bg-gray-50"
                  >
                    <img src={item.image || collectionImage} alt={item.name} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
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
                        <p className="font-serif text-2xl text-black tracking-tighter mb-1">${item.price.toFixed(0)}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 line-through">
                          ${(item.price * 2).toFixed(0)}
                        </p>
                      </div>
                    </div>
                    
                    <Link
                      to={buildCheckoutUrl({
                        item: item.name,
                        collection: "Hate",
                        price: item.price,
                        image: item.image,
                      })}
                      className="w-full py-4 bg-black text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-red-600 transition-all duration-500 text-center rounded-sm shadow-sm"
                    >
                      Buy Now
                    </Link>
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
                <span className="italic text-red-600">Own Path</span>
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-8">
                <Link
                  to="/identity-engineering"
                  className="px-12 py-5 bg-white text-black font-bold text-xs uppercase tracking-[0.5em] hover:bg-red-600 hover:text-white transition-all duration-500"
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
          <div className="absolute top-0 right-0 w-1/2 h-full bg-red-600/10 blur-[120px] -z-0 opacity-50" />
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gray-900/50 -z-0" />
        </section>
      </main>

      <Footer />
    </div>
  );
}

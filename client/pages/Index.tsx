import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, ShieldCheck, Truck, Globe, Zap, Palette, Package, Volume2, VolumeX, Play, Pause } from "lucide-react";

import Header from "@/components/Header";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import { getAllCollections } from "../lib/storefront";
import type { CollectionItem } from "../lib/storefront";
import { useEffect, useState, useRef } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Index() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayToggle = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        void videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      setIsPlaying(!videoRef.current.paused);
    }
  }, []);


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
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] selection:bg-[hsl(var(--primary))] selection:text-[hsl(var(--primary-foreground))]">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center pt-36 lg:pt-20 overflow-hidden bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
            {/* Text Side */}
            <div className="relative z-10 order-1 lg:order-1">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-[1px] bg-[hsl(var(--primary))]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-[hsl(var(--primary))]">Signature Studio</span>
                </div>
                
                <h1 className="font-slab text-5xl sm:text-7xl md:text-8xl lg:text-[5.5rem] xl:text-[7.5rem] 2xl:text-[8.5rem] font-bold leading-[0.85] tracking-tighter uppercase text-black mb-10">
                  <span className="block sm:inline mb-3 sm:mb-0">Embody</span>
                  <span className="hidden sm:inline"><br /></span>
                  <span className="block sm:inline mb-3 sm:mb-0">Your </span>
                  <span className="block sm:inline italic text-[hsl(var(--primary))] font-light">Brand</span>
                </h1>
                
                <p className="text-xl sm:text-2xl text-gray-600 font-serif italic mb-14 max-w-lg leading-relaxed">
                  "Live your purpose through every stitch, every silhouette, and every vision."
                </p>

                <div className="flex flex-col sm:flex-row gap-6">
                  <Link
                    to="/merch-designs"
                    className="group relative inline-flex items-center justify-center px-12 py-5 bg-black text-white font-bold uppercase tracking-[0.3em] text-[10px] transition-all duration-500 hover:bg-[hsl(var(--primary))] hover:scale-105"
                  >
                    <span>Shop Collection</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/identity-engineering"
                    className="group inline-flex items-center justify-center px-12 py-5 border border-black/10 text-black font-bold uppercase tracking-[0.3em] text-[10px] transition-all duration-500 hover:bg-black/5 hover:border-black"
                  >
                    Custom Design
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Image Side */}
            <div className="relative order-2 lg:order-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-[0_20px_80px_-20px_rgba(0,0,0,0.1),0_0_50px_-10px_rgba(0,0,0,0.05)] bg-white border border-gray-100 flex items-center justify-center p-12 group"
              >
                {/* Studio Spotlight Blend */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.03)_0%,rgba(0,0,0,0.01)_50%,transparent_100%)] transition-opacity duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50/20 to-transparent" />
                
                <img 
                  src="/hate beanie.jpg" 
                  alt="Hate Collection Beanie" 
                  className="relative z-10 w-full h-full object-contain mix-blend-multiply"
                />
                
                {/* Minimalist Studio Metadata */}
                <div className="absolute top-10 left-10 text-[8px] font-bold uppercase tracking-[0.5em] text-black/10 z-20">
                  Hate Collection / Studio Spec
                </div>
                <div className="absolute bottom-10 right-10 text-[8px] font-bold uppercase tracking-[0.5em] text-black/10 z-20">
                  Item: 001
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-10 hidden md:flex items-center gap-4 text-black/30">
          <span className="text-[9px] uppercase tracking-[0.4em] font-medium rotate-90 origin-left">Scroll</span>
          <div className="w-[1px] h-20 bg-gradient-to-b from-black/30 to-transparent" />
        </div>
      </section>



      {/* Trust Badges */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 md:gap-x-24">
            {[
              { icon: Zap, text: "AI ASSISTED" },
              { icon: Palette, text: "SIGNATURE STYLE" },
              { icon: Package, text: "ELITE QUALITY" },
              { icon: Globe, text: "WORLDWIDE" },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <badge.icon className="h-4 w-4 text-black/20 transition-colors group-hover:text-[hsl(var(--primary))]" />
                <span className="text-[9px] uppercase tracking-[0.4em] font-bold text-black/40 group-hover:text-black transition-colors">{badge.text}</span>
                {i !== 3 && <div className="hidden md:block w-[1px] h-4 bg-gray-100 ml-12 md:ml-24" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Presale Privilege Section */}
      <section className="relative py-32 bg-black overflow-hidden group">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-10"
          >
            <div className="inline-flex items-center gap-6 text-red-600">
              <div className="w-12 h-[1px] bg-red-600" />
              <span className="text-[10px] font-bold uppercase tracking-[0.8em] animate-pulse-slow">Special Discount Active</span>
              <div className="w-12 h-[1px] bg-red-600" />
            </div>
            
            <h2 className="font-slab text-3xl sm:text-7xl text-white uppercase tracking-tighter leading-tight">
              <span className="block mb-2 font-bold text-white tracking-tighter">
                Embody Your <span className="italic text-red-600 font-light">Brand.</span>
              </span>
              Hate Collection Legacy <br />
              <span className="text-3xl sm:text-5xl opacity-40">With 50% Presale Discount</span>
            </h2>
            
            <p className="text-white/40 font-serif italic text-2xl max-w-2xl mx-auto leading-relaxed">
              "High-quality wear designed for early buyers. Secure your favorite designs today before the collection goes public."
            </p>
            
            <div className="pt-10">
              <Link
                to="/merch-designs"
                className="inline-flex items-center justify-center px-20 py-6 bg-white text-black font-bold uppercase tracking-[0.5em] text-[11px] hover:bg-red-600 hover:text-white transition-all duration-700 rounded-sm shadow-2xl"
              >
                Order Now
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Animated Background Marquee */}
        <div className="absolute bottom-0 left-0 right-0 py-8 bg-white/[0.03] border-t border-white/5 whitespace-nowrap overflow-hidden">
          <div className="inline-block animate-marquee">
            {[1, 2].map((i) => (
              <span key={i} className="text-[14px] font-bold uppercase tracking-[0.8em] text-[hsl(var(--primary))] mx-4">
                50% OFF HATE COLLECTION PRESALE — LIMITED STOCK — 50% OFF HATE COLLECTION PRESALE — LIMITED STOCK 50% OFF HATE COLLECTION PRESALE — LIMITED STOCK — 50% OFF HATE COLLECTION PRESALE — LIMITED STOCK
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 sm:py-48 bg-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-24 items-start">
            <div className="sticky top-32">
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="w-8 h-[1px] bg-[hsl(var(--primary))]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[hsl(var(--primary))]">The Process</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-7xl mb-8 uppercase tracking-tighter leading-none">
                How it <br />
                <span className="italic">Unfolds</span>
              </h2>
              <p className="text-gray-500 text-lg font-light max-w-sm leading-relaxed mb-12">
                Our custom-made process is designed to translate your creative ideas into high-quality clothing.
              </p>
              <div className="hidden lg:block w-[1px] h-32 bg-gradient-to-b from-gray-100 to-transparent" />
            </div>

            <div className="space-y-32">
              {[
                {
                  step: "01",
                  title: "Connect Wallet",
                  desc: "Connect your digital wallet securely. Your creative journey starts with a simple click."
                },
                {
                  step: "02",
                  title: "Create Custom Design",
                  desc: "Use our custom design tools to shape your unique style with easy-to-use choices."
                },
                {
                  step: "03",
                  title: "Order and Delivery",
                  desc: "Bring your custom design to life. Each piece is crafted individually for you and delivered straight to your door."
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: i * 0.2 }}
                  className="relative pl-16 md:pl-24 group"
                >
                  <span className="absolute left-0 top-0 font-serif text-5xl italic text-gray-300 group-hover:text-[hsl(var(--primary))]/30 transition-colors duration-500">
                    {item.step}
                  </span>
                  <h3 className="font-serif text-3xl mb-6 italic text-black">{item.title}</h3>
                  <p className="text-gray-500 font-light leading-relaxed max-w-md text-lg">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Identity Engineering CTA */}
      <section className="relative py-48 overflow-hidden bg-black group">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1532453288454-ba3ae3b445c2?q=80&w=2000&auto=format&fit=crop" 
            alt="Studio Background" 
            className="w-full h-full object-cover opacity-40 transition-transform group-hover:scale-110"
            style={{ transitionDuration: "5000ms" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="font-serif text-4xl sm:text-8xl mb-12 text-white uppercase tracking-tighter leading-none">
              The <span className="italic text-[hsl(var(--primary))] font-light">Custom</span> <br />
              Studio
            </h2>
            <p className="text-xl text-white/60 mb-16 font-serif italic max-w-2xl mx-auto leading-relaxed">
              Step into the future of fashion. Our custom studio allows you to create custom clothing that mirrors your personal style.
            </p>
            <Link
              to="/identity-engineering"
              className="inline-flex items-center justify-center px-16 py-6 bg-white text-black font-bold uppercase tracking-[0.4em] text-[10px] hover:bg-[hsl(var(--primary))] hover:text-white transition-all duration-500 shadow-2xl"
            >
              Enter The Studio
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-24 sm:py-32 bg-[hsl(var(--background))] border-y border-[hsl(var(--border))]">

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-16 lg:gap-20 items-center">
            {/* Video Column */}
            <div className="lg:col-span-7 xl:col-span-8 relative aspect-video rounded-3xl overflow-hidden bg-black shadow-[0_30px_70px_-15px_rgba(0,0,0,0.3)] group border border-[hsl(var(--border))]">

              <video 
                ref={videoRef}
                src="/hatevid.MP4" 
                autoPlay 
                muted={isMuted}
                loop 
                playsInline 
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full h-full object-contain cursor-pointer"
                onClick={handlePlayToggle}
              />
              
              {/* Play/Pause Overlay */}
              <div 
                onClick={handlePlayToggle}
                className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition-all duration-500 flex items-center justify-center cursor-pointer z-20"
              >
                <div className="relative w-16 h-16 flex items-center justify-center">
                  {/* Play Button (visible when paused) */}
                  {!isPlaying && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-0 w-full h-full rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-2xl flex items-center justify-center"
                    >
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </motion.div>
                  )}

                  {/* Pause Button (visible on hover when playing) */}
                  {isPlaying && (
                    <div className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white flex items-center justify-center">
                      <Pause className="w-6 h-6 fill-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Sound Toggle */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMuted(!isMuted);
                }}
                className="absolute bottom-6 right-6 z-30 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-black/80 transition-all duration-300 shadow-xl"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col items-start text-left">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="inline-flex items-center gap-2 mb-6">
                  <div className="w-8 h-[1px] bg-[hsl(var(--primary))]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[hsl(var(--primary))]">The Vision</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-6xl mb-8 uppercase tracking-tight leading-[1.1] text-[hsl(var(--foreground))]">
                  Identity <br />
                  <span className="italic">In Motion</span>
                </h2>
                <p className="font-serif text-2xl italic text-[hsl(var(--foreground))] mb-8 leading-relaxed opacity-90">
                  "Every stitch is made with care. Every design is made to reflect your style."
                </p>
                <p className="text-[hsl(var(--muted-foreground))] text-lg font-light leading-relaxed max-w-lg">
                  Experience the perfect blend of high-quality craftsmanship and personal expression. Our process is designed to bring your unique style to life in every item we make.
                </p>
                <div className="mt-10">
                  <Link to="/identity-engineering" className="text-xs font-bold uppercase tracking-[0.3em] pb-2 border-b-2 border-[hsl(var(--primary))] text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors">
                    Explore Our Process
                  </Link>
                </div>

              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-32 sm:py-48 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="w-8 h-[1px] bg-[hsl(var(--primary))]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[hsl(var(--primary))]">The Gallery</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-7xl mb-8 uppercase tracking-tighter">Signature <br /><span className="italic">Collections</span></h2>
              <p className="text-gray-500 text-lg font-light leading-relaxed">
                Explore our curated collections, each a reflection of our seasonal style and premium quality.
              </p>
            </div>
            <Link to="/merch-designs" className="group flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-black hover:text-[hsl(var(--primary))] transition-colors pb-2 border-b border-gray-100">
              Discover All <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-2" />
            </Link>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-24">
            {collections.map((collection, index) => {
              const isLarge = index % 3 === 0;
              return (
                <motion.div 
                  key={collection.path}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1, delay: (index % 3) * 0.2 }}
                  className={`${isLarge ? "md:col-span-8" : "md:col-span-4"} group`}
                >
                  <Link to={collection.path} className="block">
                    <div className="relative aspect-[4/5] md:aspect-auto md:h-[600px] overflow-hidden bg-gray-50 mb-10 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-700 group-hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] group-hover:-translate-y-4">
                      <img
                        src={collection.image}
                        alt={collection.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        style={{ transitionDuration: "2000ms" }}
                      />
                      {collection.comingSoon && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                          <span className="px-10 py-3 border border-white/30 text-white text-[9px] uppercase tracking-[0.5em] font-bold backdrop-blur-md">Upcoming</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                    </div>
                    <div className="flex flex-col px-4">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="font-serif text-2xl sm:text-4xl mb-3 group-hover:italic transition-all duration-500 tracking-tighter">{collection.name}</h3>
                          <div className="flex items-center gap-4">
                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em]">{collection.path.includes("hate") ? "Privilege Drop" : "Seasonal Release"}</span>
                          </div>
                        </div>
                        {collection.basePrice && !collection.comingSoon && (
                          <div className="text-right">
                            <span className="font-serif text-2xl italic text-[hsl(var(--primary))] block">
                              ${collection.basePrice.toFixed(0)}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest line-through block mt-1 ${collection.path.includes("hate") ? "text-red-600" : "text-[hsl(var(--primary))]/50"}`}>
                              ${(collection.basePrice * 2).toFixed(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="w-full py-4 bg-black text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[hsl(var(--primary))] transition-all duration-500 text-center rounded-sm shadow-sm">
                        Explore Collection
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section className="py-32 sm:py-48 bg-white border-t border-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-24">
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="w-8 h-[1px] bg-[hsl(var(--primary))]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[hsl(var(--primary))]">Information</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-7xl uppercase tracking-tighter">Inquiry <span className="italic">&</span> <br /> Detail</h2>
            </div>
            
            <Accordion type="single" collapsible className="space-y-8">
              {[
                {
                  q: "How does the custom studio operate?",
                  a: "Our Signature Studio is designed to bring your creative ideas to life. Every design is a custom creation made specifically for you."
                },
                {
                  q: "What is the delivery timeline?",
                  a: "Curated collections are shipped within 7-10 days. Custom-made pieces take 14-21 days for high-quality production and delivery."
                },
                {
                  q: "Is excellence guaranteed?",
                  a: "We utilize only the most premium materials and artisanal techniques. Every garment undergoes a rigorous assessment to ensure it meets our heritage standards of excellence."
                }
              ].map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-b border-gray-100 pb-8 last:border-0">
                  <AccordionTrigger className="font-serif text-2xl md:text-3xl italic text-left hover:text-[hsl(var(--primary))] transition-all duration-500 py-4 hover:no-underline group">
                    <span className="flex items-center gap-6">
                      <span className="text-sm font-bold text-gray-400 group-hover:text-[hsl(var(--primary))] transition-colors tracking-widest">0{i+1}</span>
                      {faq.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-500 font-light text-lg leading-relaxed pt-4 pl-14">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


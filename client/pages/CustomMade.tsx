import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, AlertCircle, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import { useWallet } from "@/contexts/WalletContext";
import Footer from "@/components/Footer";
import { GenerateMockupResponse } from "@shared/api";
import { apiFetch } from "@/lib/storefront";

export default function CustomMade() {
  const navigate = useNavigate();
  const { isConnected, walletAddress } = useWallet();
  const [clothingType, setClothingType] = useState("t-shirt");
  const [baseColor, setBaseColor] = useState("black");
  const [fit, setFit] = useState("regular");
  const [brandingStyle, setBrandingStyle] = useState("typography");
  const [placement, setPlacement] = useState("chest");
  const [designPrompt, setDesignPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [mockupGenerated, setMockupGenerated] = useState(false);
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const activePreviewImage =
    placement === "chest" || placement === "sleeve" || placement === "full-print"
      ? frontImage
      : backImage;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      alert("Please connect your wallet to generate mockups");
      return;
    }

    if (!designPrompt.trim()) {
      setGenerationError("Please enter a design description");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await apiFetch("/api/generate-mockup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clothingType,
          baseColor,
          fit,
          brandingStyle,
          placement,
          designPrompt,
        }),
      });

      if (!response.ok) {
        const errorPayload = (await response
          .json()
          .catch(() => null)) as GenerateMockupResponse | null;
        throw new Error(
          errorPayload?.error || "Failed to generate mockups"
        );
      }

      const data: GenerateMockupResponse = await response.json();

      if (!data.success) {
        throw new Error(
          data.error || "Failed to generate mockups"
        );
      }

      setFrontImage(data.mockups.front);
      setBackImage(data.mockups.back);
      setMockupGenerated(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate mockups. Please try again.";
      setGenerationError(errorMessage);
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCheckout = () => {
    if (!isConnected) {
      alert("Please connect your wallet to proceed to checkout");
      return;
    }

    // Navigate to checkout with custom design details
    const queryParams = new URLSearchParams({
      item: `Custom ${clothingType}`,
      collection: "Custom Made",
      price: "49.99",
      icon: "👕",
      clothingType,
      baseColor,
      fit,
      brandingStyle,
      placement,
      designPrompt: designPrompt || "Custom design"
    });

    if (activePreviewImage) {
      queryParams.append("image", activePreviewImage);
    }

    navigate(`/checkout?${queryParams.toString()}`);
  };

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
                  <span className="text-[11px] font-bold uppercase tracking-[0.6em] text-red-600">The Custom Engine</span>
                  <div className="w-12 h-[1px] bg-red-600/30" />
                </div>
                
                <h1 className="font-serif text-[12vw] sm:text-[10vw] font-normal leading-[0.85] tracking-tighter uppercase text-black mb-16">
                  Identity <br />
                  <span className="italic text-red-600 font-light pr-4">Engineering</span>
                </h1>
                
                <div className="max-w-xl mx-auto border-l border-gray-300 pl-12 py-4 text-left mb-20">
                  <p className="text-xl sm:text-2xl text-gray-600 font-serif italic leading-relaxed">
                    "Bring your unique style to life with our custom design studio. Every stitch is made to tell your story."
                  </p>
                </div>
                
                <div className="flex items-center justify-center gap-20">
                  <div className="text-center group">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-2 group-hover:text-red-600 transition-colors">Starting At</span>
                    <span className="font-serif text-5xl italic text-black tracking-tighter">$49</span>
                  </div>
                  <div className="w-[1px] h-16 bg-gray-300 rotate-12" />
                  <div className="text-center group">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-2 group-hover:text-red-600 transition-colors">Precision</span>
                    <span className="font-serif text-5xl italic text-black tracking-tighter">Elite</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Subtle background text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02] whitespace-nowrap">
            <span className="text-[30vw] font-serif font-black uppercase italic tracking-tighter select-none">CUSTOM</span>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-40">
          <div className="grid lg:grid-cols-12 gap-24 items-start">
            {/* Form Section */}
            <div className="lg:col-span-7 space-y-16">
              {generationError && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 bg-red-50/50 border border-red-100 rounded-sm flex gap-4"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-900 mb-1">Engineering Error</h3>
                    <p className="text-sm text-red-800/80 font-serif italic">{generationError}</p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleGenerate} className="space-y-20">
                {/* Silhouette Selection */}
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-bold text-gray-500 tracking-[0.3em]">01</span>
                    <h2 className="font-serif text-2xl text-black italic">Select Silhouette</h2>
                    <div className="flex-1 h-[1px] bg-gray-300" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {["t-shirt", "hoodie", "sweatshirt", "jersey", "windbreaker", "cargo"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setClothingType(type)}
                        className={`py-5 px-6 border text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 rounded-sm ${
                          clothingType === type
                            ? "bg-black text-white border-black"
                            : "bg-transparent text-gray-500 border-gray-300 hover:border-black hover:text-black"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color and Fit */}
                <div className="grid md:grid-cols-2 gap-16">
                  <div className="space-y-8">
                    <div className="flex items-center gap-6">
                      <span className="text-[10px] font-bold text-gray-500 tracking-[0.3em]">02</span>
                      <h2 className="font-serif text-2xl text-black italic">Base Color</h2>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {[
                        { name: "black", hex: "#000000" },
                        { name: "white", hex: "#FFFFFF" },
                        { name: "navy", hex: "#001F3F" },
                        { name: "gray", hex: "#808080" },
                        { name: "cream", hex: "#FFFDD0" },
                        { name: "olive", hex: "#808000" },
                      ].map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setBaseColor(color.name)}
                          title={color.name}
                          className={`w-10 h-10 rounded-full border-2 p-0.5 transition-all duration-500 ${
                            baseColor === color.name ? "border-black scale-110 shadow-lg" : "border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          <div className="w-full h-full rounded-full" style={{ backgroundColor: color.hex }} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-6">
                      <span className="text-[10px] font-bold text-gray-500 tracking-[0.3em]">03</span>
                      <h2 className="font-serif text-2xl text-black italic">Choose Fit</h2>
                    </div>
                    <div className="flex gap-4">
                      {["oversized", "regular", "athletic"].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFit(f)}
                          className={`flex-1 py-4 border text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 rounded-sm ${
                            fit === f
                              ? "bg-black text-white border-black"
                              : "bg-transparent text-gray-500 border-gray-300 hover:border-black hover:text-black"
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Branding Style and Placement */}
                <div className="grid md:grid-cols-2 gap-16">
                  <div className="space-y-8">
                    <div className="flex items-center gap-6">
                      <span className="text-[10px] font-bold text-gray-500 tracking-[0.3em]">04</span>
                      <h2 className="font-serif text-2xl text-black italic">Branding Style</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {["typography", "graphic", "abstract", "minimal"].map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setBrandingStyle(style)}
                          className={`py-4 border text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 rounded-sm ${
                            brandingStyle === style
                              ? "bg-black text-white border-black"
                              : "bg-transparent text-gray-500 border-gray-300 hover:border-black hover:text-black"
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center gap-6">
                      <span className="text-[10px] font-bold text-gray-500 tracking-[0.3em]">05</span>
                      <h2 className="font-serif text-2xl text-black italic">Graphic Placement</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {["chest", "back", "sleeve", "full-print"].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPlacement(p)}
                          className={`py-4 border text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 rounded-sm ${
                            placement === p
                              ? "bg-black text-white border-black"
                              : "bg-transparent text-gray-500 border-gray-300 hover:border-black hover:text-black"
                          }`}
                        >
                          {p.replace("-", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Design Prompt */}
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-bold text-gray-500 tracking-[0.3em]">06</span>
                    <h2 className="font-serif text-2xl text-black italic">Design Vision</h2>
                    <div className="flex-1 h-[1px] bg-gray-300" />
                  </div>
                  <div className="relative group">
                    <textarea
                      value={designPrompt}
                      onChange={(e) => setDesignPrompt(e.target.value)}
                      placeholder="Describe your architectural vision... (e.g., 'Minimalist futuristic typography, industrial textures, monochrome palette')"
                      className="w-full px-8 py-10 bg-gray-50 border border-gray-300 rounded-sm font-serif text-xl italic text-black placeholder:text-gray-500 focus:ring-1 focus:ring-black/5 transition-all resize-none min-h-[200px]"
                    />
                    <div className="absolute bottom-6 right-8">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Prompt Engineering</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={true}
                  className="w-full py-6 font-bold text-[11px] uppercase tracking-[0.5em] bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed relative overflow-hidden flex items-center justify-center gap-4"
                >
                  Materialize Design (Coming Soon)
                </button>
              </form>
            </div>

            {/* Preview Section */}
            <div className="lg:col-span-5 lg:sticky lg:top-40">
              <div className="space-y-12">
                <div className="flex justify-between items-end">
                  <h2 className="font-serif text-4xl text-black italic">Your Custom Design</h2>
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500">Preview 001</span>
                </div>

                <div className="relative aspect-[3/4] bg-gray-50 border border-gray-300 p-1 group overflow-hidden rounded-sm">
                  <div className="w-full h-full bg-white flex items-center justify-center relative overflow-hidden">
                    {!mockupGenerated ? (
                      <div className="text-center px-12 relative z-10">
                        <div className="w-12 h-[1px] bg-gray-300 mx-auto mb-10" />
                        <p className="font-serif text-2xl italic text-gray-500 mb-4 leading-relaxed">
                          Awaiting your <br /> design choice.
                        </p>
                        <Zap className="w-8 h-8 text-gray-400 mx-auto opacity-70" />
                      </div>
                    ) : (
                      <motion.img
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5 }}
                        src={activePreviewImage || ""}
                        alt="Design mockup"
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Decorative Elements */}
                    <div className="absolute inset-0 border-[20px] border-white z-20 pointer-events-none" />
                    <div className="absolute top-10 left-10 text-[9px] font-bold uppercase tracking-widest text-black/10 z-20">Identity Eng.</div>
                    <div className="absolute bottom-10 right-10 text-[9px] font-bold uppercase tracking-widest text-black/10 z-20">Locomotive 001</div>
                  </div>
                </div>

                {mockupGenerated && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="flex justify-between items-end border-b border-gray-300 pb-8">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 block mb-2">Custom Release</span>
                        <h3 className="font-serif text-3xl text-black italic capitalize">Custom {clothingType}</h3>
                      </div>
                      <div className="text-right">
                        <span className="font-serif text-4xl text-black tracking-tighter">$49</span>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">Fixed Price</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <button
                        onClick={handleCheckout}
                        disabled={!isConnected}
                        className="w-full py-6 bg-black text-white text-[11px] font-bold uppercase tracking-[0.5em] hover:bg-red-600 transition-all duration-700 shadow-xl flex items-center justify-center gap-4 group"
                      >
                        Buy Now
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                      </button>
                      
                      <button
                        onClick={() => setMockupGenerated(false)}
                        className="w-full py-4 border border-gray-300 text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 hover:text-black hover:border-black transition-all duration-500"
                      >
                        Restart Design
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

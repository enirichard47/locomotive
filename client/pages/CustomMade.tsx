import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Zap, Download, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import { useWallet } from "@/contexts/WalletContext";
import Footer from "@/components/Footer";
import { GenerateMockupResponse } from "@shared/api";

export default function CustomMade() {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
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
      const response = await fetch("/api/generate-mockup", {
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

    navigate(`/checkout?${queryParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header />

      {/* Page Header */}
      <section className="relative border-b border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--card))]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,hsl(var(--background))_70%)]" />
          <div className="absolute top-0 left-0 w-1/2 h-full bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.05),transparent_40%)]" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_top_right,hsl(var(--secondary)/0.05),transparent_40%)]" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-[hsl(var(--foreground))]">
            Engineer Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">Identity</span>
          </h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto leading-relaxed">
            Use our AI-powered platform to translate your brand's essence into a unique digital and physical identity. Configure every detail and generate photorealistic mockups in seconds.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid lg:grid-cols-12 gap-12 items-start pt-16">
          {/* Form Section */}
          <div className="lg:col-span-7 space-y-8 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8">
            {generationError && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-900 mb-1">
                    Generation Error
                  </h3>
                  <p className="text-sm text-red-800">{generationError}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleGenerate} className="space-y-10">
              {/* Clothing Type */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  1. Select Silhouette
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    "t-shirt",
                    "hoodie",
                    "sweatshirt",
                    "jersey",
                    "windbreaker",
                    "cargo",
                  ].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setClothingType(type)}
                      className={`py-3 px-4 rounded-lg border font-medium transition-all duration-200 capitalize ${
                        clothingType === type
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))/10] text-[hsl(var(--primary))] shadow-sm"
                          : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))/50] hover:bg-[hsl(var(--accent))]"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  2. Choose Fit
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["oversized", "regular", "athletic"].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFit(f)}
                      className={`py-3 px-4 rounded-lg border font-medium transition-all duration-200 capitalize ${
                        fit === f
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))/10] text-[hsl(var(--primary))] shadow-sm"
                          : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))/50] hover:bg-[hsl(var(--accent))]"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Base Color */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  3. Base Color
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                      className={`py-3 px-4 rounded-lg border font-medium transition-all duration-200 capitalize flex items-center gap-3 ${
                        baseColor === color.name
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))/10] text-[hsl(var(--primary))] shadow-sm"
                          : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))/50] hover:bg-[hsl(var(--accent))]"
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-[hsl(var(--border))] shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Branding Style */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  4. Branding Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    "typography",
                    "symbols",
                    "graphic",
                    "minimalist",
                  ].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setBrandingStyle(style)}
                      className={`py-3 px-4 rounded-lg border font-medium transition-all duration-200 capitalize text-sm ${
                        brandingStyle === style
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))/10] text-[hsl(var(--primary))] shadow-sm"
                          : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))/50] hover:bg-[hsl(var(--accent))]"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Placement */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  5. Graphic Placement
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["chest", "back", "sleeve", "full-print"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlacement(p)}
                      className={`py-3 px-4 rounded-lg border font-medium transition-all duration-200 capitalize text-sm ${
                        placement === p
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))/10] text-[hsl(var(--primary))] shadow-sm"
                          : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))/50] hover:bg-[hsl(var(--accent))]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Design Description */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  6. Design Prompt
                </label>
                <textarea
                  value={designPrompt}
                  onChange={(e) => setDesignPrompt(e.target.value)}
                  placeholder="Describe your design in detail. E.g., 'Bold futuristic white typography with a geometric symbol, streetwear aesthetic, minimalist design'"
                  className="w-full px-4 py-3 border border-[hsl(var(--border))] rounded-lg bg-[hsl(var(--background))] focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))] focus:outline-none resize-none text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] transition-all"
                  rows={5}
                />
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
                  Be specific about colors, text, style, and placement for best results
                </p>
              </div>

              <button
                type="submit"
                disabled={isGenerating || !isConnected}
                className={`w-full py-4 px-6 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-lg shadow-lg ${
                  isGenerating || !isConnected
                    ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed"
                    : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 hover:shadow-[hsl(var(--primary))]/25 hover:-translate-y-0.5"
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[hsl(var(--primary-foreground))] border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : !isConnected ? (
                  <>
                    Connect Wallet to Generate
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Generate Mockups
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Mockup Preview Section */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                Preview
              </h2>

              {!mockupGenerated ? (
                <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--muted))] p-8 border border-[hsl(var(--border))]">
                  <div className="w-full h-full rounded-2xl bg-[hsl(var(--card))] flex items-center justify-center">
                    <div className="relative w-3/4 h-3/4 text-center flex flex-col items-center justify-center">
                      <Zap className="w-24 h-24 text-[hsl(var(--primary))]/20 mb-4" />
                      <p className="text-[hsl(var(--muted-foreground))]">
                        Your generated mockup will appear here.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Front View */}
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm">
                    <div className="aspect-square flex items-center justify-center bg-[hsl(var(--muted))]">
                      {frontImage ? (
                        <img
                          src={frontImage}
                          alt="Front view mockup"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src="https://via.placeholder.com/400x400?text=Front+View"
                          alt="Front view placeholder"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>

                  {/* Back View */}
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm">
                    <div className="aspect-square flex items-center justify-center bg-[hsl(var(--muted))]">
                      {backImage ? (
                        <img
                          src={backImage}
                          alt="Back view mockup"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src="https://via.placeholder.com/400x400?text=Back+View"
                          alt="Back view placeholder"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>

                  {/* Design Details */}
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-[hsl(var(--foreground))] mb-4">
                      Design Details
                    </h3>
                    <div className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
                      <div className="flex justify-between">
                        <span className="font-medium text-[hsl(var(--foreground))]">
                          Type:
                        </span>
                        <span className="capitalize">{clothingType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-[hsl(var(--foreground))]">
                          Fit:
                        </span>
                        <span className="capitalize">{fit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-[hsl(var(--foreground))]">
                          Color:
                        </span>
                        <span className="capitalize">{baseColor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-[hsl(var(--foreground))]">
                          Branding:
                        </span>
                        <span className="capitalize">{brandingStyle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-[hsl(var(--foreground))]">
                          Placement:
                        </span>
                        <span className="capitalize">{placement}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleCheckout}
                      disabled={!isConnected}
                      className={`w-full py-4 px-6 font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-lg ${
                        !isConnected
                          ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed"
                          : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 hover:shadow-[hsl(var(--primary))]/25"
                      }`}
                    >
                      <Download className="w-5 h-5" />
                      {!isConnected ? "Connect Wallet to Checkout" : "Proceed to Checkout"}
                    </button>
                    <button
                      onClick={() => {
                        setMockupGenerated(false);
                        setDesignPrompt("");
                        setFrontImage(null);
                        setBackImage(null);
                        setGenerationError(null);
                      }}
                      className="w-full py-3 px-6 border border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-medium rounded-lg hover:bg-[hsl(var(--accent))] transition"
                    >
                      Create Another Design
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

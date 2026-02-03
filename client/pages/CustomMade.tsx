import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Download, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import { useWallet } from "@/contexts/WalletContext";
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
        throw new Error("Failed to generate mockups");
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
      <section className="bg-gradient-to-r from-[hsl(var(--card))] to-[hsl(var(--background))] border-b border-[hsl(var(--border))] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30 rounded-full mb-6">
            <Zap className="w-4 h-4 text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium text-[hsl(var(--primary))]">Grok AI</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-[hsl(var(--foreground))]">
            Create Your Custom Design
          </h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))]">
            Configure your piece and let Grok AI generate photorealistic mockups
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form Section */}
          <div>
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
            <form onSubmit={handleGenerate} className="space-y-8">
              {/* Clothing Type */}
              <div>
                <label className="block text-sm font-bold text-[hsl(var(--foreground))] mb-4">
                  Clothing Type
                </label>
                <div className="grid grid-cols-2 gap-3">
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
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition capitalize ${
                        clothingType === type
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                          : "border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))]"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit */}
              <div>
                <label className="block text-sm font-bold text-[hsl(var(--foreground))] mb-4">
                  Fit
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["oversized", "regular", "athletic"].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFit(f)}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition capitalize ${
                        fit === f
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                          : "border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))]"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Base Color */}
              <div>
                <label className="block text-sm font-bold text-[hsl(var(--foreground))] mb-4">
                  Base Color
                </label>
                <div className="grid grid-cols-2 gap-3">
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
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition capitalize flex items-center gap-2 ${
                        baseColor === color.name
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                          : "border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))]"
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded border border-[hsl(var(--border))]"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Branding Style */}
              <div>
                <label className="block text-sm font-bold text-[hsl(var(--foreground))] mb-4">
                  Branding Style
                </label>
                <div className="grid grid-cols-2 gap-3">
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
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition capitalize ${
                        brandingStyle === style
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                          : "border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))]"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Placement */}
              <div>
                <label className="block text-sm font-bold text-[hsl(var(--foreground))] mb-4">
                  Placement
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["chest", "back", "sleeve", "full-print"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlacement(p)}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition capitalize ${
                        placement === p
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                          : "border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Design Description */}
              <div>
                <label className="block text-sm font-bold text-[hsl(var(--foreground))] mb-4">
                  Design Description
                </label>
                <textarea
                  value={designPrompt}
                  onChange={(e) => setDesignPrompt(e.target.value)}
                  placeholder="Describe your design in detail. E.g., 'Bold futuristic white typography with a geometric symbol, streetwear aesthetic, minimalist design'"
                  className="w-full px-4 py-3 border-2 border-[hsl(var(--border))] rounded-lg focus:border-[hsl(var(--primary))] focus:outline-none resize-none text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))]"
                  rows={5}
                />
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">
                  Be specific about colors, text, style, and placement for best results
                </p>
              </div>

              <button
                type="submit"
                disabled={isGenerating || !isConnected}
                className={`w-full py-4 px-6 font-bold rounded-lg transition flex items-center justify-center gap-2 text-lg ${
                  isGenerating || !isConnected
                    ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed border-2 border-[hsl(var(--border))]"
                    : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(130_99%_60%)] hover:shadow-lg hover:shadow-[hsl(var(--primary))]/50"
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
          <div>
            <div className="sticky top-24">
              <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-6">
                Preview
              </h2>

              {!mockupGenerated ? (
                <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[hsl(var(--primary))] rounded-lg mb-4">
                    <span className="text-3xl">👕</span>
                  </div>
                  <p className="text-[hsl(var(--muted-foreground))] mb-2">
                    Configure your design and click Generate to see mockups
                  </p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Front view, back view, and detail shots will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Front View */}
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
                    <div className="aspect-square flex items-center justify-center bg-[hsl(var(--muted))]">
                      {frontImage ? (
                        <img
                          src={frontImage}
                          alt="Front view mockup"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="text-6xl mb-4">👕</div>
                          <p className="text-[hsl(var(--muted-foreground))] text-sm">
                            {clothingType.toUpperCase()} - {baseColor.toUpperCase()}
                          </p>
                          <p className="text-[hsl(var(--muted-foreground))] text-xs mt-2 opacity-70">
                            Front View
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Back View */}
                  <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
                    <div className="aspect-square flex items-center justify-center bg-[hsl(var(--muted))]">
                      {backImage ? (
                        <img
                          src={backImage}
                          alt="Back view mockup"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <div className="text-6xl mb-4 opacity-75">👕</div>
                          <p className="text-[hsl(var(--muted-foreground))] text-sm">
                            {clothingType.toUpperCase()} - BACK
                          </p>
                          <p className="text-[hsl(var(--muted-foreground))] text-xs mt-2 opacity-70">
                            Back View
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Design Details */}
                  <div className="bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-xl p-6">
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
                      className={`w-full py-3 px-6 font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                        !isConnected
                          ? "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed border-2 border-[hsl(var(--border))]"
                          : "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(130_99%_60%)] transition"
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
                      className="w-full py-3 px-6 border-2 border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-bold rounded-lg hover:border-[hsl(var(--primary))] transition"
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
    </div>
  );
}

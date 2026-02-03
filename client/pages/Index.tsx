import { Link } from "react-router-dom";
import { ArrowRight, Zap, Palette, Package, Shirt } from "lucide-react";
import Header from "@/components/Header";
import { useWallet } from "@/contexts/WalletContext";

export default function Index() {
  const { isConnected } = useWallet();
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--card))] to-[hsl(var(--background))]">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--background))] to-[hsl(var(--card))]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(var(--primary))]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[hsl(var(--primary))]/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30 rounded-full mb-8">
              <Zap className="w-4 h-4 text-[hsl(var(--primary))]" />
              <span className="text-sm font-medium text-[hsl(var(--primary))]">
                Powered by Grok AI
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight text-[hsl(var(--foreground))]">
              Design Your Own{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--secondary))] to-[hsl(var(--primary))]">
                Streetwear
              </span>
            </h1>

            <p className="text-xl text-[hsl(var(--muted-foreground))] mb-8 max-w-2xl leading-relaxed">
              Create custom branded clothing with AI-generated mockups. See exactly
              how your design looks before you order. Powered by cutting-edge image
              generation technology.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/custom-made"
                className="inline-flex items-center justify-center px-8 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] hover:shadow-lg hover:shadow-[hsl(var(--primary))]/50 transition group"
              >
                Start Creating
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                to="/merch"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-bold rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10 transition"
              >
                Browse Merch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-[hsl(var(--background))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-[hsl(var(--foreground))]">
              How It Works
            </h2>
            <p className="text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              Three simple steps to create your custom streetwear
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Palette,
                title: "Design",
                description:
                  "Tell us what you want: clothing type, colors, branding style, and placement. Be as specific or creative as you like.",
              },
              {
                icon: Zap,
                title: "Generate",
                description:
                  "Our Grok AI generates photorealistic mockups in seconds, showing front and back views of your design.",
              },
              {
                icon: Package,
                title: "Order",
                description:
                  "Happy with your mockup? Proceed to payment and we'll manufacture and ship your custom piece.",
              },
            ].map((feature, idx) => (
              <div key={idx} className="group">
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-[hsl(var(--card))] rounded-lg group-hover:bg-[hsl(var(--primary))] transition">
                  <feature.icon className="w-8 h-8 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary-foreground))] transition" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-[hsl(var(--foreground))]">{feature.title}</h3>
                <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Made Showcase */}
      <section className="py-20 md:py-32 bg-[hsl(var(--card))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 text-[hsl(var(--foreground))]">
                Endless Possibilities with Custom Made
              </h2>
              <p className="text-lg text-[hsl(var(--muted-foreground))] mb-6 leading-relaxed">
                From oversized hoodies with bold typography to minimal streetwear pieces
                with strategic placement—your vision, our technology.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "T-shirts, hoodies, sweatshirts, and more",
                  "Any color, fit, and branding style",
                  "Front, back, sleeve, and full-print designs",
                  "Photorealistic fabric texture and lighting",
                  "Front and back mockup views",
                  "Ready-to-order in minutes",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-[hsl(var(--foreground))]"
                  >
                    <div className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/custom-made"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] transition group"
              >
                Create Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
            </div>

            <div className="bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--background))] rounded-2xl border border-[hsl(var(--border))] h-96 md:h-96 flex items-center justify-center">
              <div className="text-center">
                <Shirt className="w-20 h-20 text-[hsl(var(--primary))] mx-auto mb-4" />
                <p className="text-[hsl(var(--muted-foreground))]">AI-Generated Mockup Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Merch Collections */}
      <section className="py-20 md:py-32 bg-[hsl(var(--background))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-[hsl(var(--foreground))]">
              Merch Collections
            </h2>
            <p className="text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              Pre-designed Locomotive pieces ready to shop
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { name: "Combat Collection", icon: "🎖️" },
              { name: "8 Collection", icon: "8️⃣" },
              { name: "Oly Collection", icon: "🏛️" },
              { name: "Manga Collection", icon: "📚" },
              { name: "Arsenal Collection", icon: "⚔️" },
            ].map((collection, idx) => (
              <Link
                key={idx}
                to="/merch"
                className="group relative overflow-hidden rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-8 hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-5xl mb-4 block">{collection.icon}</span>
                    <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">{collection.name}</h3>
                  </div>
                  <ArrowRight className="w-6 h-6 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] group-hover:translate-x-2 transition" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/merch"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))] font-bold rounded-lg hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition group"
            >
              Shop All Merch
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[hsl(var(--card))] via-[hsl(var(--background))] to-[hsl(var(--card))]">
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--card))] via-[hsl(var(--background))] to-[hsl(var(--card))]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(var(--primary))]/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 text-[hsl(var(--foreground))]">
            Ready to Create?
          </h2>
          <p className="text-xl text-[hsl(var(--muted-foreground))] mb-8 max-w-2xl mx-auto">
            Design your custom streetwear piece in minutes. No limits, no
            compromises.
          </p>
          <Link
            to="/custom-made"
            className="inline-flex items-center justify-center px-10 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] hover:shadow-lg hover:shadow-[hsl(var(--primary))]/50 transition group text-lg"
          >
            Start Creating
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(var(--card))] border-t border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!isConnected && (
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--secondary))] rounded">
                    <span className="text-[hsl(var(--primary-foreground))] font-bold text-lg">⚡</span>
                  </div>
                  <span className="font-bold tracking-tight text-[hsl(var(--foreground))]">
                    LOCOMOTIVE
                  </span>
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  AI-powered custom streetwear design
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-[hsl(var(--foreground))]">
                  Shop
                </h4>
                <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                  <li>
                    <Link to="/custom-made" className="hover:text-[hsl(var(--primary))] transition">
                      Custom Made
                    </Link>
                  </li>
                  <li>
                    <Link to="/merch" className="hover:text-[hsl(var(--primary))] transition">
                      Merch
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-[hsl(var(--foreground))]">
                  Support
                </h4>
                <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                  <li>
                    <a href="#" className="hover:text-[hsl(var(--primary))] transition">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[hsl(var(--primary))] transition">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-[hsl(var(--foreground))]">
                  Legal
                </h4>
                <ul className="space-y-2 text-sm text-[hsl(var(--muted-foreground))]">
                  <li>
                    <a href="#" className="hover:text-[hsl(var(--primary))] transition">
                      Terms
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-[hsl(var(--primary))] transition">
                      Privacy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          )}

          <div className={`border-t border-[hsl(var(--border))] pt-8 flex flex-col md:flex-row ${!isConnected ? "justify-between" : "justify-center"} items-center text-sm text-[hsl(var(--muted-foreground))]`}>
            <p>&copy; 2024 Locomotive Store. All rights reserved.</p>
            {!isConnected && <p>Powered by Grok AI</p>}
          </div>
        </div>
      </footer>
    </div>
  );
}

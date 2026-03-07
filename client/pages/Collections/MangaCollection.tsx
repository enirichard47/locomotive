import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MangaCollection() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header />

      {/* Page Header */}
      <section className="relative min-h-[60vh] flex items-center justify-center border-b-2 border-[hsl(var(--border))] overflow-hidden">
        {/* Background image with better overlay */}
        <div className="absolute inset-0">
          <img src="/locomotive_logo.jpeg" alt="Manga Collection" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--background))]/95 via-[hsl(var(--background))]/90 to-[hsl(var(--background))]/95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,hsl(var(--background))_80%)]" />
        </div>
        
        {/* Floating geometric shapes */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-20 left-20 w-24 h-24 border-2 border-orange-500 rounded-2xl rotate-12 animate-pulse" />
          <div className="absolute bottom-20 right-20 w-32 h-32 border-2 border-[hsl(var(--primary))] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 backdrop-blur-sm">
              <span className="text-sm font-bold text-orange-500">COMING SOON</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[hsl(var(--foreground))] via-orange-500 to-[hsl(var(--primary))] bg-clip-text text-transparent">
                Manga Collection
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto leading-relaxed">
              This collection has not launched yet. Join the waitlist and be first to know when it drops.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--card))]/50 backdrop-blur-sm border border-[hsl(var(--border))]">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span className="font-medium">Launching Soon</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Details */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4">
                About This Collection
              </h2>
              <p className="text-[hsl(var(--muted-foreground))] leading-relaxed mb-6">
                The Manga Collection channels the energy and artistry of anime and manga culture. Vibrant colors, dynamic illustrations, and bold graphics define this collection. Perfect for enthusiasts who want to wear their passion on their sleeve.
              </p>
              <ul className="space-y-3">
                {[
                  "Anime-inspired artwork",
                  "Vibrant color palettes",
                  "High-quality printing",
                  "Comfort fit designs",
                  "Collectible series",
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
            </div>

            <div className="relative w-full aspect-square p-8 bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--background))] rounded-3xl overflow-hidden border border-[hsl(var(--border))]">
              <img src="/locomotive_logo.jpeg" alt="Manga collection preview" className="w-full h-full object-cover rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>

          {/* Coming Soon State */}
          <div className="mb-16">
            <div className="max-w-3xl mx-auto border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--card))] p-8 md:p-10 text-center">
              <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4">
                Manga Collection Launching Soon
              </h2>
              <p className="text-[hsl(var(--muted-foreground))] mb-8">
                We're finalizing the first drop. The checkout option will be enabled once the launch goes live.
              </p>
              <div className="inline-flex items-center px-6 py-3 rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-500 font-semibold">
                Not Available for Purchase Yet
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/identity-engineering"
              className="inline-flex items-center justify-center px-8 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] transition group"
            >
              Design Similar Piece
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
            <Link
              to="/merch-designs"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-bold rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10 transition"
            >
              Back to Merch
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

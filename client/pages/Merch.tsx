import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import { useWallet } from "@/contexts/WalletContext";
import Footer from "@/components/Footer";

export default function Merch() {
  const { isConnected } = useWallet();
  const collections = [
    {
      name: "Hate Collection",
      description: "Limited edition drops engineered for bold identities and unapologetic self-expression",
      image: "/hate.png",
      path: "/collections/hate",
    },
    {
      name: "Manga Collection",
      description: "Anime-inspired graphics and vibrant colors",
      image: "/locomotive_logo.jpeg",
      path: "/collections/manga",
    },
  ];

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
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-[hsl(var(--foreground))]">
            Exclusive Merch Designs
          </h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto leading-relaxed">
            Curated, limited-edition drops engineered for bold identities and unapologetic self-expression.
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {collections.map((collection, idx) => (
              <Link
                key={idx}
                to={collection.path}
                className="group relative overflow-hidden rounded-2xl aspect-[4/3] border border-[hsl(var(--border))] transition-all duration-300 hover:shadow-xl hover:shadow-[hsl(var(--primary))]/10"
              >
                <img
                  src={collection.image}
                  alt={`${collection.name} preview`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                <div className="relative h-full flex flex-col justify-end p-8">
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {collection.name}
                  </h3>
                  <p className="text-white/80 text-sm mb-4">
                    {collection.description}
                  </p>
                  <div className="flex items-center text-[hsl(var(--primary))] font-bold group-hover:translate-x-1 transition-transform">
                    <span>View Collection</span>
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl p-8 md:p-16 text-center overflow-hidden bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,hsl(var(--primary)/0.1),transparent_40%)] animate-[spin_20s_linear_infinite]" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 text-[hsl(var(--foreground))]">
                Want Your Own Design?
              </h2>
              <p className="text-xl text-[hsl(var(--muted-foreground))] mb-8 max-w-2xl mx-auto">
                {isConnected ? "Switch to Identity Engineering and design exactly what you want." : "Connect your wallet to start designing your own custom piece."}
              </p>
              <Link
                to="/identity-engineering"
                className="inline-flex items-center justify-center px-10 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] hover:shadow-lg hover:shadow-[hsl(var(--primary))]/50 transition group text-lg"
              >
                {isConnected ? "Start Engineering" : "Connect to Design"}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

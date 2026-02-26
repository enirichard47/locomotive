import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import { useWallet } from "@/contexts/WalletContext";
import Footer from "@/components/Footer";

export default function HateCollection() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header />

      {/* Page Header */}
      <section className="relative h-[50vh] flex items-center justify-center text-center border-b border-[hsl(var(--border))] overflow-hidden">
        <div className="absolute inset-0">
          <img src="/hate.png" alt="Hate Collection background" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--background))] via-[hsl(var(--background))]/80 to-transparent" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-[hsl(var(--foreground))]">
            The "Hate" Collection
          </h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            Curated, limited-edition drops engineered for bold identities and unapologetic self-expression.
          </p>
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
                The "Hate" Collection represents bold identities and unapologetic self-expression. Purpose-driven apparel designed for those who aren't afraid to stand out. Limited edition releases crafted with precision and intention.
              </p>
              <ul className="space-y-3">
                {[
                  "Purpose-driven apparel",
                  "Limited edition releases",
                  "Identity-based AI design",
                  "High-quality fabric and print",
                  "Custom mission statement options",
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
              <img src="/hate.png" alt="Hate collection preview" className="w-full h-full object-cover rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>

          {/* Products Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-8">
              Featured Items
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="group relative border border-[hsl(var(--border))] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[hsl(var(--primary))]/10"
                >
                  <div className="aspect-square bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--background))]">
                    <img src="/hate.png" alt={`Hate Series ${item}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-6 bg-[hsl(var(--card))]">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-[hsl(var(--foreground))] mb-1">
                          Hate Series {item}
                        </h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          Full-color print, regular fit
                        </p>
                      </div>
                      <p className="text-lg font-bold text-[hsl(var(--primary))]">
                        $54.99
                      </p>
                    </div>
                    <Link
                      to={`/checkout?item=Hate+Series+${item}&collection=Hate&price=54.99&image=/hate.png`}
                      className="mt-4 w-full py-3 px-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] transition text-center flex items-center justify-center gap-2"
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              ))}
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

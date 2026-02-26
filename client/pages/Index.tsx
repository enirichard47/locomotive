import { Link } from "react-router-dom";
import { ArrowRight, Zap, Palette, Package, Shirt } from "lucide-react";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

export default function Index() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header />

      {/* === Hero Section === */}
      <section className="relative border-b border-[hsl(var(--border))]">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--card))] opacity-50" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,hsl(var(--background))_80%)]" />
          <div className="absolute top-0 left-0 w-1/2 h-full bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.1),transparent_40%)]" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_top_right,hsl(var(--secondary)/0.1),transparent_40%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center min-h-[calc(100vh-4rem)] py-20">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30 rounded-full mb-8">
                <Zap className="w-4 h-4 text-[hsl(var(--primary))]" />
                <span className="text-sm font-medium text-[hsl(var(--primary))]">
                  Web3 Identity Engineering
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight text-[hsl(var(--foreground))]">
                Embody Your Brand.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--secondary))] to-[hsl(var(--primary))]">
                  Live Your Purpose.
                </span>
              </h1>

              <p className="text-xl text-[hsl(var(--muted-foreground))] mb-8 max-w-2xl leading-relaxed">
                A Web3 Identity Engineering platform where you can design your digital identity, embody your brand values, and express your purpose through exclusive, AI-generated merchandise.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/identity-engineering"
                  className="inline-flex items-center justify-center px-8 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] hover:shadow-lg hover:shadow-[hsl(var(--primary))]/50 transition group"
                >
                  Start Engineering
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                </Link>
                <Link
                  to="/merch-designs"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-bold rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10 transition"
                >
                  Explore Identity
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative w-full aspect-square p-8 bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--background))] rounded-3xl overflow-hidden border border-[hsl(var(--border))]">
                <img src="/hate.png" alt="Merch preview" className="w-full h-full object-cover rounded-2xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-[hsl(var(--background))] overflow-hidden">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative"
        >
          <motion.div variants={itemVariants} className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-[hsl(var(--foreground))]">
              How It Works: Forge Your Identity
            </h2>
            <p className="text-xl text-[hsl(var(--muted-foreground))] max-w-3xl mx-auto">
              Three simple steps to engineer your brand's digital presence, from concept to creation.
            </p>
          </motion.div>

          <div className="relative grid md:grid-cols-3 gap-12">
            <div className="absolute top-12 left-0 w-full h-px bg-gradient-to-r from-transparent via-[hsl(var(--border))] to-transparent hidden md:block" />
            {[
              {
                icon: Palette,
                title: "Define",
                description:
                  "Tell us your core values, mission, and brand essence. This is where your identity begins.",
              },
              {
                icon: Zap,
                title: "Generate",
                description:
                  "Our AI transforms your inputs into visual identity mockups and digital assets aligned with your purpose.",
              },
              {
                icon: Package,
                title: "Mint",
                description:
                  "Mint your identity as an NFT and unlock exclusive, purpose-driven physical merchandise.",
              },
            ].map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants} className="relative text-center px-4">
                <div className="relative inline-flex items-center justify-center w-24 h-24 bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-full mb-8 z-10 shadow-lg shadow-[hsl(var(--background))]">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--secondary))]/10 rounded-full text-[hsl(var(--primary))]">
                    <feature.icon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">{feature.title}</h3>
                <p className="text-[hsl(var(--muted-foreground))] leading-relaxed max-w-xs mx-auto">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Identity Engineering Showcase */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--background))] border-y border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 text-[hsl(var(--foreground))]">
                Endless Possibilities with Identity Engineering
              </h2>
              <p className="text-lg text-[hsl(var(--muted-foreground))] mb-6 leading-relaxed">
                From purpose-driven apparel to digital identity badges — our technology transforms your vision into wearable and collectible expressions of who you are.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "T-shirts, hoodies, and digital badges",
                  "AI-generated logo and branding concepts",
                  "Font, color, and full print design systems",
                  "Customizable with your mission statement",
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
                to="/identity-engineering"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] transition group"
              >
                Start Engineering
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </Link>
            </div>

            <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--muted))] p-8 border border-[hsl(var(--border))] shadow-2xl shadow-[hsl(var(--background))]">
              <div className="w-full h-full rounded-2xl bg-[hsl(var(--card))] flex items-center justify-center">
                <div className="relative w-3/4 h-3/4">
                  <Shirt className="w-full h-full text-[hsl(var(--muted-foreground))]/10" strokeWidth={0.5} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-24 h-24 text-[hsl(var(--primary))]/50" />
                  </div>
                </div>
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
              Exclusive Merch Collections
            </h2>
            <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-3xl mx-auto">
              Explore our curated, limited-edition drops engineered for bold identities and unapologetic self-expression.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-2 gap-8"
          >
            {[
              {
                name: "Hate Collection",
                image: "/hate.png",
                description: "Limited edition drops engineered for bold identities.",
                path: "/collections/hate",
              },
              {
                name: "Manga Collection",
                image: "/locomotive_logo.jpeg",
                description: "Anime-inspired graphics and vibrant colors.",
                path: "/collections/manga",
              },
            ].map((collection, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Link to={collection.path} className="group block">
                  <div className="relative overflow-hidden rounded-2xl aspect-[4/3] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1.5 transition-all duration-300 group-hover:border-[hsl(var(--primary))] group-hover:shadow-2xl group-hover:shadow-[hsl(var(--primary))]/20">
                    <div className="relative overflow-hidden rounded-lg h-full">
                    <img
                      src={collection.image}
                      alt={`${collection.name} preview`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-1">{collection.name}</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{collection.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-16 text-center">
            <Link
              to="/merch-designs"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))] font-bold rounded-lg hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition group"
            >
              Shop All Merch
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl p-8 md:p-16 text-center overflow-hidden bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,hsl(var(--primary)/0.1),transparent_40%)] animate-[spin_20s_linear_infinite]" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 text-[hsl(var(--foreground))]">
                Ready to Engineer Your Identity?
              </h2>
              <p className="text-xl text-[hsl(var(--muted-foreground))] mb-8 max-w-2xl mx-auto">
                Design, mint, and express your purpose through AI-generated merchandise.
              </p>
              <Link
                to="/identity-engineering"
                className="inline-flex items-center justify-center px-10 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] hover:shadow-lg hover:shadow-[hsl(var(--primary))]/50 transition group text-lg"
              >
                Start Engineering
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

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
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center min-h-[calc(100vh-4rem)] py-16 sm:py-20">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30 rounded-full mb-6 sm:mb-8">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-[hsl(var(--primary))]" />
                <span className="text-xs sm:text-sm font-medium text-[hsl(var(--primary))]">
                  Web3 Identity Engineering
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter mb-4 sm:mb-6 leading-tight text-[hsl(var(--foreground))]">
                Embody Your Brand.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--secondary))] to-[hsl(var(--primary))]">
                  Live Your Purpose.
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-[hsl(var(--muted-foreground))] mb-6 sm:mb-8 max-w-2xl leading-relaxed">
                A Web3 Identity Engineering platform where you can design your digital identity, embody your brand values, and express your purpose through exclusive, AI-generated merchandise.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/identity-engineering"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] hover:shadow-lg hover:shadow-[hsl(var(--primary))]/50 transition group text-sm sm:text-base"
                >
                  Start Engineering
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition" />
                </Link>
                <Link
                  to="/merch-designs"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-bold rounded-lg hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10 transition text-sm sm:text-base"
                >
                  Explore Identity
                </Link>
              </div>
            </div>
            <div className="relative w-full aspect-square md:block">
              <div className="relative w-full h-full p-4 sm:p-6 md:p-8 bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--background))] rounded-2xl sm:rounded-3xl overflow-hidden border border-[hsl(var(--border))]">
                <img src="/hate.png" alt="Merch preview" className="w-full h-full object-cover rounded-xl sm:rounded-2xl" />
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
          <motion.div variants={itemVariants} className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-[hsl(var(--foreground))]">
              How It Works: Forge Your Identity
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-[hsl(var(--muted-foreground))] max-w-3xl mx-auto px-4">
              Three simple steps to engineer your brand's digital presence, from concept to creation.
            </p>
          </motion.div>

          <div className="relative grid sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
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
              <motion.div key={idx} variants={itemVariants} className="relative text-center px-2 sm:px-4">
                <div className="relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] rounded-full mb-6 sm:mb-8 z-10 shadow-lg shadow-[hsl(var(--background))]">
                  <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--secondary))]/10 rounded-full text-[hsl(var(--primary))]">
                    <feature.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[hsl(var(--foreground))] mb-3 sm:mb-4">{feature.title}</h3>
                <p className="text-sm sm:text-base text-[hsl(var(--muted-foreground))] leading-relaxed max-w-xs mx-auto">
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
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-4 sm:mb-6 text-[hsl(var(--foreground))]">
                Endless Possibilities with Identity Engineering
              </h2>
              <p className="text-base sm:text-lg text-[hsl(var(--muted-foreground))] mb-4 sm:mb-6 leading-relaxed">
                From purpose-driven apparel to digital identity badges — our technology transforms your vision into wearable and collectible expressions of who you are.
              </p>
              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {[
                  "T-shirts, hoodies, and digital badges",
                  "AI-generated logo and branding concepts",
                  "Font, color, and full print design systems",
                  "Customizable with your mission statement",
                  "Ready-to-order in minutes",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-sm sm:text-base text-[hsl(var(--foreground))]"
                  >
                    <div className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/identity-engineering"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] transition group text-sm sm:text-base"
              >
                Start Engineering
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition" />
              </Link>
            </div>

            <div className="relative aspect-square rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[hsl(var(--primary))]/5 via-[hsl(var(--background))] to-[hsl(var(--secondary))]/5 p-4 sm:p-6 md:p-8 border border-[hsl(var(--border))] shadow-2xl shadow-[hsl(var(--primary))]/20 order-1 md:order-2 overflow-hidden group">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--primary))]/10 via-transparent to-[hsl(var(--secondary))]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Decorative circles */}
              <div className="absolute top-4 right-4 w-16 sm:w-20 h-16 sm:h-20 bg-[hsl(var(--primary))]/10 rounded-full blur-2xl" />
              <div className="absolute bottom-4 left-4 w-24 sm:w-32 h-24 sm:h-32 bg-[hsl(var(--secondary))]/10 rounded-full blur-3xl" />
              
              <div className="relative w-full h-full rounded-xl sm:rounded-2xl bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--muted))]/50 flex items-center justify-center overflow-hidden border border-[hsl(var(--border))]/50 backdrop-blur-sm">
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
                  backgroundSize: '40px 40px'
                }} />
                
                <div className="relative w-4/5 h-4/5 group-hover:scale-105 transition-transform duration-500">
                  <Shirt className="absolute inset-0 w-full h-full text-[hsl(var(--muted-foreground))]/5" strokeWidth={0.5} />
                  <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4">
                    <div className="relative w-full h-full">
                      {/* Glow effect behind image */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))]/20 to-[hsl(var(--secondary))]/20 blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                      
                      <img 
                        src="/locomotive_trainpic.jpeg" 
                        alt="Locomotive Train" 
                        className="relative w-full h-full object-contain drop-shadow-2xl rounded-lg transition-all duration-500 group-hover:drop-shadow-[0_0_30px_rgba(130,255,120,0.3)]" 
                      />
                      
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Merch Collections */}
      <section className="py-16 sm:py-20 md:py-32 bg-[hsl(var(--background))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-[hsl(var(--foreground))]">
              Exclusive Merch Collections
            </h2>
            <p className="text-base sm:text-lg text-[hsl(var(--muted-foreground))] max-w-3xl mx-auto px-4">
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

import { Link } from "react-router-dom";
import { ArrowRight, Zap, Palette, Package, Shirt } from "lucide-react";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

export default function Index() {
  // TODO: Add Google Fonts to your index.html
  // <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Superbubble&display=swap" rel="stylesheet">

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
    <div className="min-h-screen bg-[#EDE8D7] text-[#111827] font-['Poppins',sans-serif]">
      <Header />

      {/* === Hero Section === */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#EDE8D7] to-[#F4F1E6] opacity-50" />
        <div className="absolute inset-0 pointer-events-none">
          {/* Decorative Blobs */}
          <div className="absolute top-0 -left-40 w-[300px] h-[300px] bg-[#E4DEC8] rounded-full opacity-40 blur-xl" />
          <div className="absolute bottom-0 -right-40 w-[300px] h-[300px] bg-[#E4DEC8] rounded-full opacity-40 blur-xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center min-h-[calc(100vh-4rem)] py-20">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8EDB5A]/10 border border-[#8EDB5A]/30 rounded-full mb-8">
                <Zap className="w-4 h-4 text-[#8EDB5A]" />
                <span className="text-lg font-medium text-[#8EDB5A]">
                  Web3 Identity Engineering
                </span>
              </div>

              <h1 className="font-['Superbubble',cursive,sans-serif] font-extrabold text-7xl sm:text-8xl md:text-[96px] leading-[1.1] mb-6">
                Embody Your Brand.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8EDB5A] via-[#7C3AED] to-[#8EDB5A]">
                  Live Your Purpose.
                </span>
              </h1>

              <p className="text-2xl sm:text-3xl text-[#6B7280] mb-8 max-w-2xl leading-relaxed">
                A Web3 Identity Engineering platform where you can design your digital identity, embody your brand values, and express your purpose through exclusive, AI-generated merchandise.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/identity-engineering"
                  className="inline-flex items-center justify-center px-8 py-4 text-2xl bg-[#8EDB5A] text-white font-semibold rounded-[10px] transition duration-300 ease-in-out hover:bg-[#7BCB4A] hover:-translate-y-0.5"
                >
                  Start Engineering
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/merch-designs"
                  className="inline-flex items-center justify-center px-6 py-3 text-2xl bg-[#7C3AED] text-white font-medium rounded-lg"
                >
                  Explore Identity
                </Link>
              </div>
            </div>
            <div className="relative w-full aspect-square md:block">
              <div className="relative w-full h-full p-6 bg-gradient-to-br from-[#F4F1E6] to-[#EDE8D7] rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                <img src="/hate.png" alt="Merch preview" className="w-full h-full object-cover rounded-2xl" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-[#EDE8D7] overflow-hidden">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="max-w-7xl mx-auto px-6 lg:px-8 relative"
        >
          <motion.div variants={itemVariants} className="text-center mb-16 md:mb-20">
            <h2 className="font-['Superbubble',cursive,sans-serif] font-extrabold text-6xl sm:text-7xl md:text-[72px] mb-6">
              How It Works: Forge Your Identity
            </h2>
            <p className="text-2xl sm:text-3xl text-[#6B7280] max-w-3xl mx-auto">
              Three simple steps to engineer your brand's digital presence, from concept to creation.
            </p>
          </motion.div>

          <div className="relative grid sm:grid-cols-2 md:grid-cols-3 gap-8">
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
                <div className="relative inline-flex items-center justify-center w-24 h-24 bg-[#F4F1E6] rounded-full mb-8 z-10 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#8EDB5A]/10 to-[#7C3AED]/10 rounded-full text-[#8EDB5A]">
                    <feature.icon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold mb-4">{feature.title}</h3>
                <p className="text-xl text-[#6B7280] leading-relaxed max-w-xs mx-auto">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Identity Engineering Showcase */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-[#F4F1E6] to-[#EDE8D7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="font-['Superbubble',cursive,sans-serif] font-extrabold text-6xl sm:text-7xl md:text-[72px] mb-6">
                Endless Possibilities with Identity Engineering
              </h2>
              <p className="text-2xl sm:text-3xl text-[#6B7280] mb-6 leading-relaxed">
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
                    className="flex items-center gap-3 text-2xl"
                  >
                    <div className="w-2 h-2 bg-[#8EDB5A] rounded-full flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/identity-engineering"
                className="inline-flex items-center justify-center px-8 py-4 text-2xl bg-[#8EDB5A] text-white font-semibold rounded-[10px] transition duration-300 ease-in-out hover:bg-[#7BCB4A] hover:-translate-y-0.5"
              >
                Start Engineering
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            <div className="relative order-1 md:order-2">
              {/* Decorative background elements */}
              <div className="absolute -inset-4 bg-gradient-to-br from-[#8EDB5A]/10 via-[#EDE8D7]/5 to-[#7C3AED]/10 rounded-[2.5rem] blur-3xl opacity-60" />
              <div className="absolute top-8 -right-8 w-32 h-32 bg-[#8EDB5A]/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[#7C3AED]/20 rounded-full blur-3xl" />
              
              {/* Video container */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#8EDB5A]/30 group bg-gradient-to-br from-[#F4F1E6] to-[#EDE8D7] p-1">
                <div className="relative rounded-[1.4rem] overflow-hidden bg-black">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8EDB5A]/30 via-transparent to-[#7C3AED]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />
                  
                  <video 
                    src="/hatevid.MP4" 
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="relative w-full h-auto object-contain max-h-[700px] transition-transform duration-700 group-hover:scale-[1.02]" 
                  />
                  
                  {/* Elegant border shine effect */}
                  <div className="absolute inset-0 rounded-[1.4rem] border-2 border-white/10 group-hover:border-white/20 transition-colors duration-500 pointer-events-none" />
                  
                  {/* Subtle overlay shine */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Merch Collections */}
      <section className="py-20 md:py-32 bg-[#EDE8D7]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-['Superbubble',cursive,sans-serif] font-extrabold text-6xl sm:text-7xl md:text-[72px] mb-6">
              Exclusive Merch Collections
            </h2>
            <p className="text-2xl sm:text-3xl text-[#6B7280] max-w-3xl mx-auto">
              Explore our curated, limited-edition drops engineered for bold identities and unapologetic self-expression.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-2 gap-10"
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
                <Link to={collection.path} className="group block transition-transform duration-300 hover:-translate-y-1">
                  <div className="relative overflow-hidden rounded-[20px] aspect-[4/3] bg-[#F4F1E6] shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
                    <div className="relative overflow-hidden rounded-lg h-full">
                    <img
                      src={collection.image}
                      alt={`${collection.name} preview`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-3xl font-bold mb-2">{collection.name}</h3>
                    <p className="text-xl text-[#6B7280]">{collection.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-16 text-center">
            <Link
              to="/merch-designs"
              className="inline-flex items-center gap-2 px-10 py-5 text-2xl border-2 border-[#8EDB5A] text-[#8EDB5A] font-bold rounded-lg hover:bg-[#8EDB5A] hover:text-white transition group"
            >
              Shop All Merch
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="relative rounded-[20px] p-10 md:p-16 text-center overflow-hidden bg-[#F4F1E6] shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,#8EDB5A/10,transparent_40%)] animate-[spin_20s_linear_infinite]" />
            <div className="relative">
              <h2 className="font-['Superbubble',cursive,sans-serif] font-extrabold text-6xl sm:text-7xl md:text-[72px] mb-6">
                Ready to Engineer Your Identity?
              </h2>
              <p className="text-3xl text-[#6B7280] mb-8 max-w-2xl mx-auto">
                Design, mint, and express your purpose through AI-generated merchandise.
              </p>
              <Link
                to="/identity-engineering"
                className="inline-flex items-center justify-center px-8 py-4 text-3xl bg-[#8EDB5A] text-white font-semibold rounded-[10px] transition duration-300 ease-in-out hover:bg-[#7BCB4A] hover:-translate-y-0.5"
              >
                Start Engineering
                <ArrowRight className="ml-2 w-5 h-5" />
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

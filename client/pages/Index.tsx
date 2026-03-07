import { Link } from "react-router-dom";
import { ArrowRight, Zap, Palette, Package, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import { getAllCollections } from "@/lib/storefront";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function SectionHeader({
  title,
  description,
  align = "center",
}: {
  title: string;
  description: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-lg">{description}</p>
    </div>
  );
}

export default function Index() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.45,
      },
    },
  };

  const collections = getAllCollections();
  const faqs = [
    {
      question: "How do I place an order?",
      answer:
        "Connect your wallet, choose a collection or generate a custom identity design, then proceed to checkout and complete payment with the payment link.",
    },
    {
      question: "Can I save my generated designs?",
      answer:
        "Yes. After generating a mockup in Identity Engineering, use Save to Profile and your design will appear in your profile gallery.",
    },
    {
      question: "How is shipping calculated?",
      answer:
        "Shipping is free for Lagos orders and includes a delivery fee for other locations. The fee is shown clearly in checkout before payment.",
    },
    {
      question: "Can I track my order status?",
      answer:
        "Yes. Open your Dashboard to see each order stage: pending, processing, shipped, and delivered.",
    },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <Header />

      <section className="relative overflow-hidden border-b border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--background))] via-[hsl(var(--card))]/30 to-[hsl(var(--background))]">
        {/* Animated gradient backgrounds */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 right-[-8rem] h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-[hsl(var(--primary))]/20 via-[hsl(var(--primary))]/5 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-[-10rem] left-[-8rem] h-[36rem] w-[36rem] rounded-full bg-gradient-to-tr from-blue-500/15 via-blue-500/5 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-[hsl(var(--secondary))]/8 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '2s' }} />
        </div>

        {/* Animated grid overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[linear-gradient(90deg,transparent_1px,currentColor_1px),linear-gradient(transparent_1px,currentColor_1px)] bg-[size:50px_50px]" />

        <div className="relative mx-auto grid min-h-[80vh] max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 md:min-h-[85vh] md:py-16 lg:grid-cols-[1fr_0.95fr] lg:gap-20 lg:px-8">
          <motion.div 
            className="max-w-xl lg:max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div 
              className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-[hsl(var(--primary))]/30 bg-gradient-to-r from-[hsl(var(--primary))]/15 to-[hsl(var(--primary))]/5 px-5 py-2.5 backdrop-blur-xl shadow-lg shadow-[hsl(var(--primary))]/5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Sparkles className="h-4 w-4 text-[hsl(var(--primary))] animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-sm font-semibold tracking-wide bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]/70 bg-clip-text text-transparent">Web3 Identity Engineering</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              className="text-5xl font-black leading-[1.08] tracking-tighter sm:text-6xl lg:text-7xl xl:text-8xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <span className="block text-[hsl(var(--foreground))]">Transform</span>
              <span className="mt-2 block">
                <span className="inline-block bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--primary))]/80 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
                  Identity Into
                </span>
              </span>
              <span className="mt-3 block text-[hsl(var(--foreground))]">
                Culture &
                <span className="inline-block ml-2 bg-gradient-to-r from-blue-400 via-[hsl(var(--secondary))] to-[hsl(var(--primary))] bg-clip-text text-transparent">Assets</span>.
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p 
              className="mt-7 max-w-lg text-base leading-relaxed text-[hsl(var(--muted-foreground))]/80 sm:text-lg font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              A Web3 identity platform where you design digital presence, express values, and turn ideas into premium AI-generated merchandise. <span className="text-[hsl(var(--foreground))] font-medium">Build culture. Create legacy.</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <Link
                to="/identity-engineering"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/80 px-8 py-4 font-bold text-[hsl(var(--primary-foreground))] transition duration-300 hover:shadow-2xl hover:shadow-[hsl(var(--primary))]/40 hover:-translate-y-1 active:translate-y-0 relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
                <span className="relative flex items-center gap-2">
                  Start Engineering
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </span>
              </Link>
              <Link
                to="/merch-designs"
                className="group inline-flex items-center justify-center rounded-2xl border-2 border-[hsl(var(--primary))]/40 bg-gradient-to-br from-[hsl(var(--card))]/50 to-[hsl(var(--card))]/20 px-8 py-4 font-bold text-[hsl(var(--foreground))] transition duration-300 hover:border-[hsl(var(--primary))]/60 hover:bg-[hsl(var(--primary))]/8 hover:shadow-xl hover:shadow-[hsl(var(--primary))]/15 hover:-translate-y-1 active:translate-y-0 backdrop-blur-sm"
              >
                <span className="flex items-center gap-2">
                  Explore Collections
                  <Package className="h-4 w-4 transition group-hover:scale-110" />
                </span>
              </Link>
            </motion.div>

            {/* Feature Pills */}
            <motion.div 
              className="mt-10 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              {[
                { icon: "✨", text: "No Design Skills" },
                { icon: "🔐", text: "Wallet-Native Checkout" },
                { icon: "⚡", text: "1-Week Delivery" },
              ].map((item, idx) => (
                <motion.span
                  key={item.text}
                  className="group inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary))]/25 bg-gradient-to-r from-[hsl(var(--primary))]/12 to-[hsl(var(--primary))]/5 px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] transition hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--primary))]/15 hover:shadow-lg hover:shadow-[hsl(var(--primary))]/10 cursor-default backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-sm">{item.icon}</span>
                  {item.text}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right side - Product showcase */}
          <motion.div 
            className="relative w-full max-w-[35rem] lg:ml-auto"
            initial={{ opacity: 0, scale: 0.9, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Enhanced background glow */}
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-[hsl(var(--primary))]/30 via-blue-500/20 to-transparent blur-3xl opacity-60" />
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tl from-[hsl(var(--secondary))]/20 via-transparent to-transparent blur-3xl opacity-40" />
            
            {/* Image card */}
            <motion.div 
              className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-[hsl(var(--primary))]/35 bg-gradient-to-b from-[hsl(var(--card))] via-[hsl(var(--card))]/80 to-[hsl(var(--background))] p-5 shadow-2xl shadow-[hsl(var(--primary))]/20 backdrop-blur-sm group"
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))]/5 to-transparent pointer-events-none rounded-3xl" />
              
              <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[hsl(var(--card))] to-[hsl(var(--background))]">
                <img 
                  src="/hate.png" 
                  alt="Merch preview" 
                  className="h-full w-full rounded-2xl object-contain object-center drop-shadow-xl transition duration-300 group-hover:scale-105" 
                />
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 via-transparent to-white/5" />
              </div>

              {/* Featured badge */}
              <motion.div 
                className="absolute bottom-6 left-6 rounded-xl border border-[hsl(var(--primary))]/40 bg-gradient-to-br from-[hsl(var(--background))]/95 to-[hsl(var(--background))]/85 px-4 py-3 backdrop-blur-xl shadow-xl shadow-black/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                  <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
                  Featured Collection
                </div>
                <p className="mt-1 text-sm font-bold text-[hsl(var(--foreground))]">Hate Collection</p>
              </motion.div>

              {/* Floating elements */}
              <motion.div 
                className="absolute top-6 right-6 h-16 w-16 rounded-2xl border border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/10 backdrop-blur-sm flex items-center justify-center text-2xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                ✨
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 md:py-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={itemVariants} className="mb-14 md:mb-16">
            <SectionHeader
              title="How It Works"
              description="Three focused steps to turn your mission into wearable and collectible identity assets."
            />
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
            {[
              {
                icon: Palette,
                step: "01",
                title: "Define",
                description:
                  "Share your values, mission, and brand direction to establish a clear identity foundation.",
              },
              {
                icon: Zap,
                step: "02",
                title: "Generate",
                description:
                  "AI transforms your inputs into aligned visuals, mockups, and practical brand expressions.",
              },
              {
                icon: Package,
                step: "03",
                title: "Mint",
                description:
                  "Finalize your identity and unlock exclusive physical and digital merchandise drops.",
              },
            ].map((feature) => (
              <motion.article
                key={feature.title}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-7 transition hover:-translate-y-1 hover:border-[hsl(var(--primary))]/35 hover:shadow-xl hover:shadow-[hsl(var(--primary))]/10"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                  <div className="absolute -top-24 -right-20 h-40 w-40 rounded-full bg-[hsl(var(--primary))]/10 blur-3xl" />
                </div>

                <div className="relative mb-5 flex items-center justify-between">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--primary))]/15 to-blue-500/15 text-[hsl(var(--primary))]">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold tracking-[0.22em] text-[hsl(var(--muted-foreground))]">{feature.step}</span>
                </div>

                <h3 className="relative text-xl font-bold sm:text-2xl">{feature.title}</h3>
                <p className="relative mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-base">{feature.description}</p>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="border-y border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))]/45 via-[hsl(var(--background))] to-[hsl(var(--card))]/45 py-24 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <div className="max-w-lg">
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-[2.9rem]">Identity Engineering In Motion</h2>
            <p className="mt-4 text-base leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-lg">
              From apparel to digital assets, your concepts are translated into cohesive design systems you can wear, share, and scale.
            </p>
            <ul className="mt-7 space-y-3.5 text-sm sm:text-base">
              {[
                "T-shirts, hoodies, and digital badges",
                "AI-generated logo and branding concepts",
                "Color, typography, and print-ready templates",
                "Mission-aligned customization controls",
                "Ready-to-order workflow in minutes",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-[hsl(var(--foreground))]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/identity-engineering"
              className="mt-9 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-7 py-3 font-semibold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[hsl(var(--primary))]/30"
            >
              Start Engineering
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative w-full max-w-[34rem] lg:ml-auto">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[hsl(var(--primary))]/20 to-blue-500/20 blur-2xl" />
            <div className="relative h-[34rem] overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-black p-1.5 shadow-xl shadow-black/15 sm:h-[38rem] md:h-[44rem]">
              <video
                src="/hatevid.MP4"
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full rounded-[1.2rem] object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <SectionHeader
              title="Exclusive Merch Collections"
              description="Explore curated drops engineered for bold identities and unapologetic self-expression."
              align="center"
            />
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-8 md:grid-cols-2 md:gap-10"
          >
            {collections.map((collection) => (
              <motion.div key={collection.path} variants={itemVariants}>
                {collection.comingSoon ? (
                  <article aria-disabled="true" className="group cursor-not-allowed opacity-90">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
                      <img
                        src={collection.image}
                        alt={`${collection.name} preview`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent" />
                    </div>
                    <div className="mt-5 space-y-2">
                      <span className="inline-flex items-center rounded-full border border-orange-400/40 bg-orange-500/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-700">
                        Coming Soon
                      </span>
                      <h3 className="text-2xl font-bold">{collection.name}</h3>
                      <p className="text-[hsl(var(--muted-foreground))]">{collection.description}</p>
                    </div>
                  </article>
                ) : (
                  <Link to={collection.path} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] transition hover:shadow-xl hover:shadow-[hsl(var(--primary))]/10">
                      <img
                        src={collection.image}
                        alt={`${collection.name} preview`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent" />
                    </div>
                    <div className="mt-5 space-y-2">
                      <h3 className="text-2xl font-bold">{collection.name}</h3>
                      <p className="text-[hsl(var(--muted-foreground))]">{collection.description}</p>
                    </div>
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-12 text-center">
            <Link
              to="/merch-designs"
              className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-7 py-3 font-semibold text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--primary))]/35 hover:bg-[hsl(var(--primary))]/5"
            >
              Shop All Merch
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="faq" className="border-y border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--card))]/30 to-[hsl(var(--background))] py-24 md:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 md:mb-12">
            <SectionHeader
              title="Frequently Asked Questions"
              description="Quick answers about ordering, identity design, and delivery."
            />
          </div>

          <div className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]/80 p-4 sm:p-6">
            <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`item-${index}`}
                className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]/70 px-5 sm:px-6 data-[state=open]:border-[hsl(var(--primary))]/45"
              >
                <AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline hover:text-[hsl(var(--primary))] sm:text-lg">
                  <span className="inline-flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))]">
                      {index + 1}
                    </span>
                    {item.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-base">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-[hsl(var(--primary))]/45 bg-gradient-to-br from-[hsl(var(--primary))]/30 via-[hsl(var(--primary))]/22 to-[hsl(var(--primary))]/14 p-8 md:p-12">
            <div className="pointer-events-none absolute inset-0 opacity-80">
              <div className="absolute -top-24 left-1/3 h-64 w-64 rounded-full bg-[hsl(var(--primary))]/35 blur-3xl" />
              <div className="absolute -bottom-20 right-1/4 h-64 w-64 rounded-full bg-[hsl(var(--primary))]/28 blur-3xl" />
            </div>

            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary))]/45 bg-[hsl(var(--primary))]/28 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--foreground))]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Start Today
                </span>

                <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                  Ready to Engineer Your Identity?
                </h2>

                <p className="mt-4 max-w-xl text-base leading-relaxed text-[hsl(var(--foreground))]/85 sm:text-lg">
                  Design, mint, and express your purpose through AI-generated merchandise with a build flow made for speed, quality, and uniqueness.
                </p>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  {[
                    "Fast AI mockups",
                    "Wallet-native checkout",
                    "Premium limited drops",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[hsl(var(--primary))]/45 bg-[hsl(var(--primary))]/24 px-3.5 py-1.5 text-xs font-medium text-[hsl(var(--foreground))]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[hsl(var(--primary))]/45 bg-[hsl(var(--primary))]/20 p-4 shadow-lg shadow-[hsl(var(--primary))]/15 backdrop-blur-sm sm:p-5">
                <div className="flex flex-col gap-3">
                  <Link
                    to="/identity-engineering"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-7 py-3 font-semibold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[hsl(var(--primary))]/30"
                  >
                    Start Engineering
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/merch-designs"
                    className="inline-flex items-center justify-center rounded-xl border border-[hsl(var(--primary))]/50 bg-[hsl(var(--primary))]/28 px-7 py-3 font-semibold text-[hsl(var(--foreground))] transition hover:bg-[hsl(var(--primary))]/40"
                  >
                    Explore Collections
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

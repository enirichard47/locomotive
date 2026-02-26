import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Community() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
      <Header />

      <main className="flex-grow">
        <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--card))] to-[hsl(var(--background))]">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--background))] to-[hsl(var(--card))]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(var(--primary))]/10 rounded-full blur-3xl" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-[hsl(var(--foreground))] mb-6">
              Community Train
            </h1>
            <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl">
              Join a vibrant community of users passionate about digital identity and self-expression.
            </p>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
                  Our Discord Community
                </h2>
                <p className="text-[hsl(var(--muted-foreground))] mb-6">
                  Get sneak peeks of new collections, share your custom designs, and connect with others who are exploring their digital identity. This is the place to be for all things Locomotive.
                </p>
                <ul className="space-y-3 text-[hsl(var(--foreground))]">
                  {[
                    "Real-time merch drop alerts",
                    "Share and get feedback on your designs",
                    "Exclusive community-only events",
                    "Early access to new features",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary))]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Join us on</p>
                    <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                      Discord
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/30 flex items-center justify-center text-[hsl(var(--primary))] font-bold">
                    #
                  </div>
                </div>
                <p className="text-[hsl(var(--muted-foreground))] mb-6">
                  Jump into the official Locomotive Discord to share your creations, get inspired, and be part of our growing community.
                </p>
                <a
                  href="https://discord.gg/locomotive"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] transition"
                >
                  Join Discord
                </a>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-3">
                  The invite link will be updated before going live.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

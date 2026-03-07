import { useState } from "react";
import { Mail, MessageSquare, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWallet } from "@/contexts/WalletContext";
import type { SupportTicketResponse } from "@shared/api";

export default function Support() {
  const { walletAddress } = useWallet();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/support-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
          walletAddress: walletAddress ?? undefined,
        }),
      });

      const data = (await response.json()) as SupportTicketResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to submit ticket right now.");
      }

      toast.success(`Ticket submitted successfully (${data.ticketId}).`);
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ticket submission failed.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="relative rounded-3xl border-2 border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--primary))]/5 p-10 md:p-12 mb-8 overflow-hidden">
          {/* Floating blur effects */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[hsl(var(--primary))]/10 to-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-[hsl(var(--primary))]/10 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 mb-6">
              <MessageSquare className="w-4 h-4 text-[hsl(var(--primary))]" />
              <span className="text-sm font-semibold text-[hsl(var(--primary))]">We're Here to Help</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[hsl(var(--foreground))] to-[hsl(var(--primary))] bg-clip-text text-transparent">
                Support Center
              </span>
            </h1>
            
            <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl">
              Reach us for order issues, account support, or identity design guidance. We typically respond within 24 hours.
            </p>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4 mb-8">
          <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <Mail className="w-6 h-6 text-[hsl(var(--primary))]" />
            <h2 className="font-bold mt-4">Email</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">support@locomotive.design</p>
          </article>
          <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <Phone className="w-6 h-6 text-[hsl(var(--primary))]" />
            <h2 className="font-bold mt-4">Phone</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">+234 800 000 0000</p>
          </article>
          <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <MessageSquare className="w-6 h-6 text-[hsl(var(--primary))]" />
            <h2 className="font-bold mt-4">Response Time</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">Usually within 6 hours</p>
          </article>
        </section>

        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4">
          <h2 className="text-2xl font-bold">Send Us A Message</h2>
          <p className="text-[hsl(var(--muted-foreground))] text-sm">
            Submit a support ticket and our team will follow up quickly.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <textarea
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2"
            rows={5}
            placeholder="How can we help?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            className="px-5 py-3 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold inline-flex items-center gap-2"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isSubmitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}

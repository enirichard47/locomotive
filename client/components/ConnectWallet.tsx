import { useState, useEffect } from "react";
import { X, Wallet } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { createPortal } from "react-dom";
import { apiFetch } from "@/lib/storefront";

interface PhantomProvider {
  isPhantom?: boolean;
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  signMessage?: (message: Uint8Array, display?: "utf8" | "hex") => Promise<{ signature: Uint8Array }>;
  on: (event: string, callback: () => void) => void;
  off: (event: string, callback: () => void) => void;
}

declare global {
  interface Window {
    phantom?: {
      solana?: PhantomProvider;
    };
  }
}

export default function ConnectWallet() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, walletAddress, connect, disconnect } = useWallet();

  const toBase64 = (bytes: Uint8Array) => {
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return window.btoa(binary);
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const provider = window.phantom?.solana;

      if (!provider) {
        setError(
          "Phantom wallet not detected. Please install the Phantom wallet extension."
        );
        // Redirect to Phantom download
        window.open("https://phantom.app/", "_blank");
        setIsLoading(false);
        return;
      }

      if (!provider.isPhantom) {
        setError("Please use the Phantom wallet extension.");
        setIsLoading(false);
        return;
      }

      // Prompt wallet connection each time instead of silently restoring from storage.
      const response = await provider.connect({ onlyIfTrusted: false });
      const publicKey = response.publicKey.toString();

      if (!provider.signMessage) {
        throw new Error("This wallet does not support message signing. Please use Phantom.");
      }

      const challengeResponse = await apiFetch("/api/auth/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ walletAddress: publicKey }),
      });

      if (!challengeResponse.ok) {
        throw new Error("Failed to create authentication challenge.");
      }

      const challengePayload = await challengeResponse.json() as { message: string; nonce: string };
      const encodedMessage = new TextEncoder().encode(challengePayload.message);
      const signed = await provider.signMessage(encodedMessage, "utf8");

      const verifyResponse = await apiFetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          walletAddress: publicKey,
          nonce: challengePayload.nonce,
          signature: toBase64(signed.signature),
        }),
      });

      const verifyPayload = await verifyResponse.json() as { authenticated?: boolean; isAdmin?: boolean; expiresAt?: number; error?: string };

      if (!verifyResponse.ok || !verifyPayload.authenticated) {
        throw new Error(verifyPayload.error || "Wallet authentication failed.");
      }

      connect(publicKey, Boolean(verifyPayload.isAdmin), verifyPayload.expiresAt);
      setIsOpen(false);
    } catch (err: any) {
      const message = typeof err?.message === "string" ? err.message : "";
      if (message.includes("User rejected")) {
        setError("Connection rejected. Please try again.");
      } else {
        setError(message || "Failed to connect wallet");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const provider = window.phantom?.solana;
      await apiFetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (provider) {
        await provider.disconnect();
      }
      disconnect();
    } catch (err: any) {
      console.error("Error disconnecting:", err);
      disconnect();
    }
  };

  // Listen for wallet connection changes
  useEffect(() => {
    const provider = window.phantom?.solana;
    if (!provider) return;

    const handleConnect = () => {
      // Wallet connected
    };

    const handleDisconnect = () => {
      disconnect();
    };

    provider.on("connect", handleConnect);
    provider.on("disconnect", handleDisconnect);

    return () => {
      provider.off("connect", handleConnect);
      provider.off("disconnect", handleDisconnect);
    };
  }, [disconnect]);

  if (isConnected && walletAddress) {
    return (
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 border border-[hsl(var(--border))]">
          <Wallet className="w-4 h-4 text-[hsl(var(--primary))]" />
          <span className="text-xs font-medium tracking-widest text-[hsl(var(--foreground))]">
            {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-xs uppercase tracking-[0.2em] font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 transition-all duration-300 shadow-sm"
      >
        Connect
      </button>

      {isOpen && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => {
                if (!isLoading) setIsOpen(false);
              }}
            />

            <div className="relative bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-10 max-w-md w-full z-10">
              <button
                onClick={() => {
                  if (!isLoading) setIsOpen(false);
                }}
                disabled={isLoading}
                className="absolute top-6 right-6 p-2 hover:text-[hsl(var(--primary))] transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="font-serif text-3xl text-[hsl(var(--foreground))] mb-4">
                Connect <span className="italic">Wallet</span>
              </h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))] font-light leading-relaxed mb-10">
                Connect your Phantom wallet to access exclusive collections and start your engineering journey on Solana.
              </p>

              {error && (
                <div className="mb-8 p-4 border border-red-500/20 bg-red-500/5">
                  <p className="text-xs text-red-500 uppercase tracking-widest">{error}</p>
                </div>
              )}

              <button
                onClick={handleConnect}
                disabled={isLoading}
                className="w-full px-8 py-5 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] font-bold uppercase tracking-[0.2em] text-xs hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
              >
                <span>{isLoading ? "Connecting..." : "Connect Phantom"}</span>
              </button>

              <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-8 text-center uppercase tracking-[0.2em] font-light">
                By connecting, you agree to our terms.
              </p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

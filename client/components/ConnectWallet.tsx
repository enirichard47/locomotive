import { useState, useEffect } from "react";
import { X, Wallet } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { createPortal } from "react-dom";

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

      const challengeResponse = await fetch("/api/auth/challenge", {
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

      const verifyResponse = await fetch("/api/auth/verify", {
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
      await fetch("/api/auth/logout", {
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
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-4 py-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-full">
          <Wallet className="w-5 h-5 text-[hsl(var(--primary))]" />
          <span className="text-base font-medium text-[hsl(var(--foreground))]">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          className="px-5 py-2 text-sm font-medium text-[hsl(var(--primary))] bg-transparent border border-[hsl(var(--primary))] rounded-full hover:bg-[hsl(var(--primary))]/10 transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-2 text-base font-medium font-sans text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] rounded-full hover:bg-[hsl(130_99%_60%)] transition shadow-lg shadow-[hsl(var(--primary))]/30"
      >
        Connect Wallet
      </button>

      {isOpen && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => {
                if (!isLoading) setIsOpen(false);
              }}
            />

            <div className="relative bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-8 max-w-md w-full z-10">
              <button
                onClick={() => {
                  if (!isLoading) setIsOpen(false);
                }}
                disabled={isLoading}
                className="absolute top-4 right-4 p-2 hover:bg-[hsl(var(--muted))] rounded-lg transition disabled:opacity-50"
              >
                <X className="w-5 h-5 text-[hsl(var(--foreground))]" />
              </button>

              <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
                Connect Phantom Wallet
              </h2>
              <p className="text-[hsl(var(--muted-foreground))] mb-6">
                Connect your Phantom wallet to start creating custom designs and
                placing orders on Solana.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              <button
                onClick={handleConnect}
                disabled={isLoading}
                className="w-full px-6 py-4 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-2 border-[hsl(var(--primary))] rounded-lg transition flex items-center justify-center gap-3 group font-medium hover:bg-[hsl(130_99%_60%)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-2xl">👻</span>
                <span>
                  {isLoading ? "Connecting..." : "Connect Phantom Wallet"}
                </span>
              </button>

              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-6 text-center">
                By connecting a wallet, you agree to our Terms of Service and
                Privacy Policy
              </p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

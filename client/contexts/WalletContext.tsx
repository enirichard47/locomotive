import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiFetch } from "@/lib/storefront";

type AuthSession = {
  address: string;
  isAdmin: boolean;
  expiresAt: number;
};

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  isAdmin: boolean;
  isSessionReady: boolean;
  connect: (address: string, isAdmin?: boolean, expiresAt?: number) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);

  const connect = (address: string, nextIsAdmin = false, expiresAt?: number) => {
    const normalizedAddress = address.trim();

    setWalletAddress(normalizedAddress);
    setIsConnected(true);
    setIsAdmin(nextIsAdmin);
    setSessionExpiresAt(typeof expiresAt === "number" ? expiresAt : null);
    setIsSessionReady(true);
  };

  const disconnect = () => {
    setWalletAddress(null);
    setIsConnected(false);
    setIsAdmin(false);
    setSessionExpiresAt(null);
    setIsSessionReady(true);
  };

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const response = await apiFetch("/api/auth/session", {
          credentials: "include",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          authenticated?: boolean;
          walletAddress?: string | null;
          isAdmin?: boolean;
          expiresAt?: number;
        };

        if (!mounted) {
          return;
        }

        if (payload.authenticated && typeof payload.walletAddress === "string" && payload.walletAddress.trim()) {
          connect(payload.walletAddress, Boolean(payload.isAdmin), typeof payload.expiresAt === "number" ? payload.expiresAt : undefined);
          return;
        }

        disconnect();
      } catch {
        if (mounted) {
          disconnect();
        }
      }
    };

    void loadSession();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sessionExpiresAt) {
      return;
    }

    const delay = sessionExpiresAt - Date.now();
    if (delay <= 0) {
      disconnect();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      disconnect();
    }, delay);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionExpiresAt]);

  return (
    <WalletContext.Provider value={{ isConnected, walletAddress, isAdmin, isSessionReady, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

import { createContext, useContext, useState, ReactNode } from "react";

const WALLET_STORAGE_KEY = "locomotive_wallet_session";

type StoredWalletSession = {
  address: string;
  isAdmin: boolean;
};

const readStoredWalletSession = (): StoredWalletSession | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(WALLET_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<StoredWalletSession>;
    if (typeof parsed.address !== "string" || !parsed.address.trim()) {
      return null;
    }

    return {
      address: parsed.address.trim(),
      isAdmin: Boolean(parsed.isAdmin),
    };
  } catch {
    return null;
  }
};

const writeStoredWalletSession = (session: StoredWalletSession | null) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (session) {
      window.localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(WALLET_STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures and keep the in-memory session working.
  }
};

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  isAdmin: boolean;
  connect: (address: string, isAdmin?: boolean) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const storedSession = readStoredWalletSession();
  const [isConnected, setIsConnected] = useState(Boolean(storedSession));
  const [walletAddress, setWalletAddress] = useState<string | null>(storedSession?.address ?? null);
  const [isAdmin, setIsAdmin] = useState(storedSession?.isAdmin ?? false);

  const connect = (address: string, nextIsAdmin = false) => {
    const normalizedAddress = address.trim();

    setWalletAddress(normalizedAddress);
    setIsConnected(true);
    setIsAdmin(nextIsAdmin);
    writeStoredWalletSession({ address: normalizedAddress, isAdmin: nextIsAdmin });
  };

  const disconnect = () => {
    setWalletAddress(null);
    setIsConnected(false);
    setIsAdmin(false);
    writeStoredWalletSession(null);
  };

  return (
    <WalletContext.Provider value={{ isConnected, walletAddress, isAdmin, connect, disconnect }}>
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

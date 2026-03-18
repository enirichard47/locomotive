import { createContext, useContext, useState, ReactNode } from "react";

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  isAdmin: boolean;
  connect: (address: string, isAdmin?: boolean) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const connect = (address: string, nextIsAdmin = false) => {
    setWalletAddress(address);
    setIsConnected(true);
    setIsAdmin(nextIsAdmin);
  };

  const disconnect = () => {
    setWalletAddress(null);
    setIsConnected(false);
    setIsAdmin(false);
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

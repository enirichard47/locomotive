import { createContext, useContext, useState, ReactNode } from "react";

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  connect: (address: string) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connect = (address: string) => {
    setWalletAddress(address);
    setIsConnected(true);
  };

  const disconnect = () => {
    setWalletAddress(null);
    setIsConnected(false);
  };

  return (
    <WalletContext.Provider value={{ isConnected, walletAddress, connect, disconnect }}>
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

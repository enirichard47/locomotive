import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireWallet?: boolean;
}

/**
 * ProtectedRoute component that requires wallet connection
 * @param children - Component to render if wallet is connected
 * @param requireWallet - If true, requires wallet connection to access. Default: true
 */
export function ProtectedRoute({ children, requireWallet = true }: ProtectedRouteProps) {
  const { isConnected } = useWallet();

  if (requireWallet && !isConnected) {
    // Redirect to home if wallet is required but not connected
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

/**
 * PublicRoute component that blocks access when wallet is connected
 * Used for Home and Collection pages - only accessible when NOT connected
 */
export function PublicRoute({ children }: { children: ReactNode }) {
  const { isConnected } = useWallet();

  if (isConnected) {
    // Redirect to dashboard if already connected
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

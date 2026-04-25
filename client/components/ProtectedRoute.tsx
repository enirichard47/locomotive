import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireWallet?: boolean;
  adminOnly?: boolean;
  nonAdminOnly?: boolean;
}

/**
 * ProtectedRoute component that requires wallet connection
 * @param children - Component to render if wallet is connected
 * @param requireWallet - If true, requires wallet connection to access. Default: true
 */
export function ProtectedRoute({
  children,
  requireWallet = true,
  adminOnly = false,
  nonAdminOnly = false,
}: ProtectedRouteProps) {
  const { isConnected, isAdmin, isSessionReady } = useWallet();

  if (!isSessionReady) {
    return null;
  }

  if (requireWallet && !isConnected) {
    // Redirect to home if wallet is required but not connected
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (nonAdminOnly && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

/**
 * PublicRoute component that blocks access when wallet is connected
 * Used for Home and Collection pages - only accessible when NOT connected
 */
export function PublicRoute({ children }: { children: ReactNode }) {
  const { isConnected, isAdmin, isSessionReady } = useWallet();

  if (!isSessionReady) {
    return null;
  }

  if (isConnected) {
    // Redirect admins directly to admin dashboard
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    }
    // Redirect regular users to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

/**
 * NonAdminRoute allows guests and regular users, but redirects connected admins.
 * Use this for user-facing pages that admins should never access.
 */
export function NonAdminRoute({ children }: { children: ReactNode }) {
  const { isConnected, isAdmin, isSessionReady } = useWallet();

  if (!isSessionReady) {
    return null;
  }

  if (isConnected && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext";
import { ProtectedRoute, PublicRoute, NonAdminRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import CustomMade from "./pages/CustomMade";
import Merch from "./pages/Merch";
import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";
import PaymentReturn from "./pages/PaymentReturn.tsx";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCollections from "./pages/Admin/AdminCollections";
import AdminOrders from "./pages/Admin/AdminOrders";
import HateCollection from "./pages/Collections/HateCollection";
import MangaCollection from "./pages/Collections/MangaCollection";
import DynamicCollection from "./pages/Collections/DynamicCollection";
import Community from "./pages/Community";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <WalletProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes - only accessible when NOT connected */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Index />
                </PublicRoute>
              }
            />
            <Route
              path="/collections/hate"
              element={
                <NonAdminRoute>
                  <HateCollection />
                </NonAdminRoute>
              }
            />
            <Route
              path="/collections/manga"
              element={
                <NonAdminRoute>
                  <MangaCollection />
                </NonAdminRoute>
              }
            />
            <Route
              path="/collections/:slug"
              element={
                <NonAdminRoute>
                  <DynamicCollection />
                </NonAdminRoute>
              }
            />

            {/* Protected routes - only accessible when connected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute nonAdminOnly>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute nonAdminOnly>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute nonAdminOnly>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/collections"
              element={
                <ProtectedRoute adminOnly>
                  <AdminCollections />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute adminOnly>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <NonAdminRoute>
                  <Checkout />
                </NonAdminRoute>
              }
            />
            <Route path="/payment/return" element={<PaymentReturn />} />

            {/* Accessible routes - can be viewed before login but actions disabled */}
            <Route
              path="/identity-engineering"
              element={
                <NonAdminRoute>
                  <CustomMade />
                </NonAdminRoute>
              }
            />
            <Route
              path="/merch-designs"
              element={
                <NonAdminRoute>
                  <Merch />
                </NonAdminRoute>
              }
            />
            <Route
              path="/community"
              element={
                <NonAdminRoute>
                  <Community />
                </NonAdminRoute>
              }
            />
            <Route
              path="/support"
              element={
                <NonAdminRoute>
                  <Support />
                </NonAdminRoute>
              }
            />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

const rootElement = document.getElementById("root") as HTMLElement & { _root?: any };

if (rootElement) {
  if (!rootElement._root) {
    rootElement._root = createRoot(rootElement);
  }
  rootElement._root.render(<App />);
}

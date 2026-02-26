import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import CustomMade from "./pages/CustomMade";
import Merch from "./pages/Merch";
import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";
import HateCollection from "./pages/Collections/HateCollection";
import MangaCollection from "./pages/Collections/MangaCollection";
import Community from "./pages/Community";
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
            <Route path="/collections/hate" element={<HateCollection />} />
            <Route path="/collections/manga" element={<MangaCollection />} />

            {/* Protected routes - only accessible when connected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            {/* Accessible routes - can be viewed before login but actions disabled */}
            <Route path="/identity-engineering" element={<CustomMade />} />
            <Route path="/merch-designs" element={<Merch />} />
            <Route path="/community" element={<Community />} />

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

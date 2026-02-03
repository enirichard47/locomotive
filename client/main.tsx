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
import CombatCollection from "./pages/Collections/CombatCollection";
import EightCollection from "./pages/Collections/EightCollection";
import OlyCollection from "./pages/Collections/OlyCollection";
import MangaCollection from "./pages/Collections/MangaCollection";
import ArsenalCollection from "./pages/Collections/ArsenalCollection";
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
            <Route path="/collections/combat" element={<CombatCollection />} />
            <Route path="/collections/8" element={<EightCollection />} />
            <Route path="/collections/oly" element={<OlyCollection />} />
            <Route path="/collections/manga" element={<MangaCollection />} />
            <Route path="/collections/arsenal" element={<ArsenalCollection />} />

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
            <Route path="/custom-made" element={<CustomMade />} />
            <Route path="/merch" element={<Merch />} />

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

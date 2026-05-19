import { useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import Footer from "@/components/Footer";
import ConnectWallet from "@/components/ConnectWallet";
import { useWallet } from "@/contexts/WalletContext";
import { getAllCollections, getOrders } from "../lib/storefront";
import type { CollectionItem, StoreOrder } from "../lib/storefront";
import { LayoutGrid, Package, ArrowRight, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { isConnected, isAdmin } = useWallet();
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);

  useEffect(() => {
    let mounted = true;

    Promise.all([getAllCollections(), getOrders()])
      .then(([items, orderItems]) => {
        if (!mounted) return;
        setCollections(items);
        setOrders(orderItems);
      })
      .catch(() => {
        if (!mounted) return;
        setCollections([]);
        setOrders([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0),
    [orders],
  );

  const adminCollections = collections.filter(c => c.source === "admin").length;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] selection:bg-[hsl(var(--primary))] selection:text-[hsl(var(--primary-foreground))] flex flex-col">
        <AdminHeader />
        <main className="flex-1 flex items-center justify-center max-w-xl mx-auto w-full px-4 py-28">
          <div className="border border-[hsl(var(--border))] bg-white p-12 text-center shadow-sm w-full">
            <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-[hsl(var(--primary))] block mb-4">
              Authorized Entry
            </span>
            <h1 className="font-serif text-4xl font-bold leading-tight uppercase text-black mb-4">
              Admin <br />
              <span className="italic font-light">Dashboard</span>
            </h1>
            <p className="text-gray-500 font-serif italic text-sm mb-10 leading-relaxed">
              "Access is restricted to verified store administrators. Connect your credentialed wallet below."
            </p>
            <div className="inline-flex">
              <ConnectWallet />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex flex-col">
        <AdminHeader />
        <main className="flex-1 flex items-center justify-center max-w-xl mx-auto w-full px-4 py-28">
          <div className="border border-red-500/20 bg-red-500/[0.02] p-12 text-center w-full">
            <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-red-600 block mb-4">
              Security Alert
            </span>
            <h1 className="font-serif text-4xl font-bold leading-tight uppercase text-black mb-4">
              Access <span className="italic font-light text-red-600">Denied</span>
            </h1>
            <p className="text-gray-500 font-serif italic text-sm mb-8 leading-relaxed">
              "Your connected wallet address is not registered in the control list of administrators. Verify your credentials."
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[hsl(var(--foreground))]">
      <AdminHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Editorial Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-100 pb-12 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-[1px] bg-[hsl(var(--primary))]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-[hsl(var(--primary))]">
                Studio Hub
              </span>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold uppercase tracking-tighter text-black">
              System <span className="italic font-light text-[hsl(var(--primary))]">Overview</span>
            </h1>
            <p className="text-gray-500 font-serif italic text-lg max-w-md">
              Welcome to the administrator control center. Curate collections, track payments, and review fulfillment metrics.
            </p>
          </div>
        </div>

        {/* Minimalist Stats Grid */}
        <section className="grid sm:grid-cols-3 border border-gray-100 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 shadow-sm">
          {/* Total Orders Card */}
          <div className="p-10 hover:bg-gray-50/50 transition-colors group">
            <div className="flex items-start justify-between mb-8">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Orders Registered
              </span>
              <Package className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors" />
            </div>
            <div className="space-y-2">
              <p className="font-slab text-5xl font-bold text-black tracking-tight">
                {orders.length}
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {orders.length > 0 ? "Fulfillment pending" : "No orders yet"}
              </p>
            </div>
          </div>

          {/* Total Income Card */}
          <div className="p-10 hover:bg-gray-50/50 transition-colors group">
            <div className="flex items-start justify-between mb-8">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Total Earnings
              </span>
              <TrendingUp className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors" />
            </div>
            <div className="space-y-2">
              <p className="font-slab text-5xl font-bold text-black tracking-tight">
                ${totalRevenue.toFixed(2)}
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Across {orders.length} transaction{orders.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Collections Card */}
          <div className="p-10 hover:bg-gray-50/50 transition-colors group">
            <div className="flex items-start justify-between mb-8">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">
                Curated Volumes
              </span>
              <LayoutGrid className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors" />
            </div>
            <div className="space-y-2">
              <p className="font-slab text-5xl font-bold text-black tracking-tight">
                {collections.length}
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Includes {adminCollections} custom release{adminCollections !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </section>

        {/* Large Navigation Cards */}
        <section className="grid md:grid-cols-2 gap-8">
          <Link
            to="/admin/collections"
            className="group relative border border-gray-100 rounded-3xl p-10 bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col justify-between min-h-[300px]"
          >
            {/* Visual background lines */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gray-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10 flex justify-between items-start">
              <div className="space-y-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[hsl(var(--primary))]">
                  Gallery Curation
                </span>
                <h3 className="font-serif text-3xl font-bold text-black group-hover:italic transition-all duration-300">
                  Collections Studio
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                  Create new dynamic lookbooks, update product items, change base prices, and manage launch phases.
                </p>
              </div>
              <LayoutGrid className="w-6 h-6 text-gray-400 group-hover:text-[hsl(var(--primary))] transition-colors" />
            </div>

            <div className="relative z-10 w-full py-4 mt-8 bg-black text-white text-[10px] font-bold uppercase tracking-[0.4em] group-hover:bg-[hsl(var(--primary))] transition-all duration-500 text-center rounded-sm flex items-center justify-center gap-2">
              <span>Manage Collections</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="group relative border border-gray-100 rounded-3xl p-10 bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col justify-between min-h-[300px]"
          >
            {/* Visual background lines */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gray-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 flex justify-between items-start">
              <div className="space-y-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[hsl(var(--primary))]">
                  Fulfillment Log
                </span>
                <h3 className="font-serif text-3xl font-bold text-black group-hover:italic transition-all duration-300">
                  Store Orders
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
                  Track buyer transactions, review shipping details, check waybills, and update manual order status.
                </p>
              </div>
              <Package className="w-6 h-6 text-gray-400 group-hover:text-[hsl(var(--primary))] transition-colors" />
            </div>

            <div className="relative z-10 w-full py-4 mt-8 bg-black text-white text-[10px] font-bold uppercase tracking-[0.4em] group-hover:bg-[hsl(var(--primary))] transition-all duration-500 text-center rounded-sm flex items-center justify-center gap-2">
              <span>Review Store Orders</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}

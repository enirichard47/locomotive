import { useEffect, useMemo, useState } from "react";
import AdminHeader from "@/components/AdminHeader";
import Footer from "@/components/Footer";
import ConnectWallet from "@/components/ConnectWallet";
import { useWallet } from "@/contexts/WalletContext";
import { getAllCollections, getOrders } from "../lib/storefront";
import type { CollectionItem, StoreOrder } from "../lib/storefront";
import { LayoutGrid, Package, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";



export default function AdminDashboard() {
  const { isConnected, isAdmin } = useWallet();
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);

  useEffect(() => {
    let mounted = true;

    Promise.all([getAllCollections(), getOrders()])
      .then(([items, orderItems]) => {
        if (!mounted) {
          return;
        }

        setCollections(items);
        setOrders(orderItems);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

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
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <AdminHeader />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-12 text-center">
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-3">
              Admin Dashboard
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] mb-8 text-lg">
              Connect wallet to continue.
            </p>
            <div className="inline-flex">
              <ConnectWallet />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <AdminHeader />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-12 text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-3">Access Denied</h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              This wallet is not authorized for the admin dashboard.
            </p>
          </div>
        </main>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--card))]/30">
      <AdminHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Header Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[hsl(var(--foreground))] to-[hsl(var(--primary))] bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] text-lg">
              Welcome to your admin hub. Manage collections, orders and deliveries.
            </p>
          </div>


        </div>

        {/* Stats Grid */}
        <section className="grid md:grid-cols-3 gap-6">
          {/* Total Orders Card */}
          <div className="group bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/40 transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Total Orders</p>
                <p className="text-4xl font-bold text-[hsl(var(--foreground))] mt-2">{orders.length}</p>
              </div>
              <div className="p-3 bg-blue-500/15 rounded-lg group-hover:bg-blue-500/25 transition">
                <Package className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-xs text-blue-600 font-semibold">{orders.length > 0 ? "Ready for fulfillment" : "No orders yet"}</p>
          </div>

          {/* Total Revenue Card */}
          <div className="group bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-2xl p-8 hover:border-green-500/40 transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Total Income</p>
                <p className="text-4xl font-bold text-[hsl(var(--foreground))] mt-2">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-500/15 rounded-lg group-hover:bg-green-500/25 transition">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="text-xs text-green-600 font-semibold">{orders.length} transaction{orders.length !== 1 ? "s" : ""}</p>
          </div>

          {/* Collections Card */}
          <div className="group bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/40 transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Total Collections</p>
                <p className="text-4xl font-bold text-[hsl(var(--foreground))] mt-2">{collections.length}</p>
              </div>
              <div className="p-3 bg-purple-500/15 rounded-lg group-hover:bg-purple-500/25 transition">
                <LayoutGrid className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <p className="text-xs text-purple-600 font-semibold">{adminCollections} custom collection{adminCollections !== 1 ? 's' : ''}</p>
          </div>
        </section>

        {/* Navigation Cards */}
        <section className="grid md:grid-cols-2 gap-6">
          <Link
            to="/admin/orders"
            className="group bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8 hover:border-[hsl(var(--primary))] hover:shadow-lg transition duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition">
                  Orders
                </h3>
                <p className="text-[hsl(var(--muted-foreground))] mt-2">Track payments and update order status</p>
              </div>
              <Package className="w-8 h-8 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition" />
            </div>
            <div className="inline-flex items-center text-[hsl(var(--primary))] font-semibold text-sm mt-4">
              Manage Orders
              <span className="ml-2">-&gt;</span>
            </div>
          </Link>

          <Link
            to="/admin/collections"
            className="group bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-8 hover:border-[hsl(var(--primary))] hover:shadow-lg transition duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition">
                  Collections
                </h3>
                <p className="text-[hsl(var(--muted-foreground))] mt-2">Manage and create new collections</p>
              </div>
              <LayoutGrid className="w-8 h-8 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition" />
            </div>
            <div className="inline-flex items-center text-[hsl(var(--primary))] font-semibold text-sm mt-4">
              Manage Collections
              <span className="ml-2">-&gt;</span>
            </div>
          </Link>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

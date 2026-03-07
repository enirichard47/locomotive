import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  X,
  MapPin,
  Mail,
  Phone,
  User,
  Download,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWallet } from "@/contexts/WalletContext";
import { isAdminWallet, getOrders } from "@/lib/storefront";
import type { StoreOrder, OrderStatus } from "@/lib/storefront";

const isImageSource = (value?: string) =>
  Boolean(value && (value.startsWith("/") || value.startsWith("http")));

export default function Dashboard() {
  const navigate = useNavigate();
  const { walletAddress } = useWallet();
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  // Redirect admins to admin dashboard
  useEffect(() => {
    if (isAdminWallet(walletAddress)) {
      navigate("/admin");
    }
  }, [walletAddress, navigate]);

  // Get orders from localStorage filtered by wallet
  const allOrders = getOrders();
  const orders = useMemo(
    () => allOrders.filter((o) => o.walletAddress.toLowerCase() === walletAddress?.toLowerCase()),
    [allOrders, walletAddress]
  );
  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0),
    [orders]
  );
  const inTransitCount = useMemo(
    () => orders.filter((o) => o.status === "shipped" || o.status === "processing").length,
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const byFilter = orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesQuery =
        !query ||
        order.itemName.toLowerCase().includes(query) ||
        order.collectionName.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });

    return [...byFilter].sort((a, b) => {
      const timeA = +new Date(a.createdAt);
      const timeB = +new Date(b.createdAt);
      return sortBy === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [orders, searchQuery, sortBy, statusFilter]);

  const handleExportOrders = () => {
    if (filteredOrders.length === 0) {
      toast.error("No orders to export for the current filters.");
      return;
    }

    const csvRows = [
      ["Order ID", "Item", "Collection", "Status", "Quantity", "Unit Price", "Total", "Date"],
      ...filteredOrders.map((order) => [
        order.id,
        order.itemName,
        order.collectionName,
        order.status,
        order.quantity.toString(),
        order.unitPrice.toFixed(2),
        order.total.toFixed(2),
        new Date(order.createdAt).toISOString(),
      ]),
    ];

    const csvContent = csvRows
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `locomotive-orders-${Date.now()}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    toast.success("Orders CSV export started.");
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "delivered":
        return "text-green-500 bg-green-500/10";
      case "shipped":
        return "text-blue-500 bg-blue-500/10";
      case "processing":
        return "text-yellow-500 bg-yellow-500/10";
      case "pending":
        return "text-orange-500 bg-orange-500/10";
      case "cancelled":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "delivered":
        return <CheckCircle2 className="w-5 h-5" />;
      case "shipped":
        return <Truck className="w-5 h-5" />;
      case "processing":
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "cancelled":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "processing":
        return "Processing";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--background))] to-[hsl(var(--card))]/30">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/60 rounded-2xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-[hsl(var(--foreground))]">
                  Dashboard
                </h1>
              </div>
            </div>
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[hsl(var(--card))] border-2 border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-medium rounded-xl hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5 transition-all duration-300 group"
            >
              <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </div>
          <p className="text-[hsl(var(--muted-foreground))] text-lg">
            Welcome back, <span className="font-mono text-[hsl(var(--primary))]">{walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}</span>
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-2 border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/40 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                Total Orders
              </h3>
              <Package className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              {orders.length}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">Lifetime purchases</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/20 rounded-2xl p-8 hover:border-green-500/40 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                Total Spent
              </h3>
              <DollarSign className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
              ${totalSpent.toFixed(2)}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">All-time total</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-2 border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/40 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                In Transit
              </h3>
              <TrendingUp className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
              {inTransitCount}
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">Active shipments</p>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--primary))]/10 border-2 border-[hsl(var(--border))] rounded-2xl p-10 mb-12 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))]/5 via-transparent to-[hsl(var(--primary))]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-3">
                Create New Design
              </h2>
              <p className="text-[hsl(var(--muted-foreground))] text-lg">
                Design and order your next custom piece with AI-powered tools
              </p>
            </div>
            <Link
              to="/identity-engineering"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[hsl(var(--primary))] to-green-500 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <Package className="w-5 h-5" />
              Create Design
            </Link>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">
              Your Orders
            </h2>
            <span className="px-3 py-1 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] rounded-full text-sm font-bold">
              {filteredOrders.length}
            </span>
          </div>

          <div className="mb-6 grid lg:grid-cols-4 gap-3">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search item, collection, or order ID"
              className="lg:col-span-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | OrderStatus)}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "oldest")}
                className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
              <button
                onClick={handleExportOrders}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))] transition"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {filteredOrders.length === 0 && (
              <div className="bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--background))] border-2 border-dashed border-[hsl(var(--border))] rounded-2xl p-12 text-center">
                <Package className="w-16 h-16 text-[hsl(var(--muted-foreground))]/50 mx-auto mb-4" />
                <p className="text-[hsl(var(--muted-foreground))] text-lg mb-2 font-medium">
                  No matching orders
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]/70">
                  Try a different search query or filter.
                </p>
              </div>
            )}

            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-gradient-to-br from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--primary))]/5 border-2 border-[hsl(var(--border))] rounded-2xl p-8 hover:border-[hsl(var(--primary))]/50 hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <div className="grid md:grid-cols-4 gap-8 items-center">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--card))] rounded-xl flex items-center justify-center text-4xl border-2 border-[hsl(var(--border))] shadow-lg">
                      {isImageSource(order.image) ? (
                        <img
                          src={order.image}
                          alt={order.itemName}
                          className="h-full w-full rounded-md object-cover"
                        />
                      ) : (
                        <span>{order.image ?? "👕"}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[hsl(var(--foreground))]">
                        {order.itemName}
                      </h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))] font-medium">
                        {order.collectionName}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]/70 mt-1">
                        {order.color}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[hsl(var(--background))]/50 rounded-xl p-4 border border-[hsl(var(--border))]/50">
                    <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2 font-bold">
                      Order ID
                    </p>
                    <p className="font-mono text-xs text-[hsl(var(--foreground))] bg-[hsl(var(--background))] px-2 py-1 rounded border border-[hsl(var(--border))]">
                      {order.id.slice(0, 16)}...
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-3">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>

                  <div className="bg-[hsl(var(--background))]/50 rounded-xl p-4 border border-[hsl(var(--border))]/50">
                    <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3 font-bold">
                      Status
                    </p>
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status)}
                    </div>
                  </div>

                  <div className="text-right bg-[hsl(var(--background))]/50 rounded-xl p-4 border border-[hsl(var(--border))]/50">
                    <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2 font-bold">
                      Total
                    </p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-green-500 bg-clip-text text-transparent">
                      ${order.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                      Qty: {order.quantity}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedOrder(null)}>
          <div className="bg-gradient-to-br from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--primary))]/5 border-2 border-[hsl(var(--border))] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-[hsl(var(--primary))]/10 animate-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-br from-[hsl(var(--card))]/95 via-[hsl(var(--card))]/95 to-[hsl(var(--primary))]/15 backdrop-blur-xl border-b-2 border-[hsl(var(--border))] p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--foreground))] to-[hsl(var(--primary))] bg-clip-text text-transparent">Order Details</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 font-mono">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 rounded-xl bg-[hsl(var(--background))] border-2 border-[hsl(var(--border))] flex items-center justify-center hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 hover:scale-110 hover:rotate-90 transition-all duration-200 shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Product Info */}
              <div className="bg-gradient-to-br from-[hsl(var(--background))]/80 via-[hsl(var(--card))] to-[hsl(var(--primary))]/5 rounded-2xl p-6 border-2 border-[hsl(var(--border))] shadow-lg hover:shadow-[hsl(var(--primary))]/10 transition-shadow duration-300">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--card))] rounded-xl flex items-center justify-center text-5xl border-2 border-[hsl(var(--border))] shadow-lg flex-shrink-0">
                    {isImageSource(selectedOrder.image) ? (
                      <img
                        src={selectedOrder.image}
                        alt={selectedOrder.itemName}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <span>{selectedOrder.image ?? "👕"}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">{selectedOrder.itemName}</h3>
                    <p className="text-[hsl(var(--muted-foreground))] mb-3">{selectedOrder.collectionName} Collection</p>
                    <div className="flex flex-wrap gap-3">
                      <span className="px-3 py-1 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] rounded-full text-sm font-semibold">
                        Color: {selectedOrder.color}
                      </span>
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-sm font-semibold">
                        Qty: {selectedOrder.quantity}
                      </span>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border-2 ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        {getStatusLabel(selectedOrder.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Details */}
              <div className="bg-gradient-to-br from-[hsl(var(--background))]/80 via-[hsl(var(--card))] to-green-500/5 rounded-2xl p-6 border-2 border-[hsl(var(--border))] shadow-lg hover:shadow-green-500/10 transition-shadow duration-300">
                <h4 className="text-lg font-bold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[hsl(var(--primary))]" />
                  Payment Summary
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">Unit Price</span>
                    <span className="font-semibold text-[hsl(var(--foreground))]">${selectedOrder.unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">Quantity</span>
                    <span className="font-semibold text-[hsl(var(--foreground))]">{selectedOrder.quantity}</span>
                  </div>
                  <div className="pt-3 border-t-2 border-[hsl(var(--border))] flex items-center justify-between">
                    <span className="text-lg font-bold text-[hsl(var(--foreground))]">Total Amount</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-green-500 bg-clip-text text-transparent">
                      ${selectedOrder.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">Payment Method</span>
                    <span className="text-sm font-semibold text-[hsl(var(--foreground))] capitalize">{selectedOrder.paymentMethod || 'payment-link'}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-gradient-to-br from-[hsl(var(--background))]/80 via-[hsl(var(--card))] to-blue-500/5 rounded-2xl p-6 border-2 border-[hsl(var(--border))] shadow-lg hover:shadow-blue-500/10 transition-shadow duration-300">
                <h4 className="text-lg font-bold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[hsl(var(--primary))]" />
                  Delivery Information
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-[hsl(var(--muted-foreground))] mt-0.5" />
                    <div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-bold">Full Name</p>
                      <p className="text-[hsl(var(--foreground))] font-semibold mt-1">{selectedOrder.deliveryDetails.fullName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[hsl(var(--muted-foreground))] mt-0.5" />
                    <div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-bold">Email</p>
                      <p className="text-[hsl(var(--foreground))] font-semibold mt-1">{selectedOrder.deliveryDetails.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[hsl(var(--muted-foreground))] mt-0.5" />
                    <div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-bold">Phone</p>
                      <p className="text-[hsl(var(--foreground))] font-semibold mt-1">{selectedOrder.deliveryDetails.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[hsl(var(--muted-foreground))] mt-0.5" />
                    <div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-bold">Delivery Address</p>
                      <p className="text-[hsl(var(--foreground))] font-semibold mt-1">{selectedOrder.deliveryDetails.address}</p>
                      <p className="text-[hsl(var(--foreground))] mt-1">
                        {selectedOrder.deliveryDetails.city}, {selectedOrder.deliveryDetails.state} {selectedOrder.deliveryDetails.postalCode}
                      </p>
                      <p className="text-[hsl(var(--primary))] font-semibold mt-1">{selectedOrder.deliveryDetails.country}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div className="bg-gradient-to-br from-[hsl(var(--background))]/80 via-[hsl(var(--card))] to-purple-500/5 rounded-2xl p-6 border-2 border-[hsl(var(--border))] shadow-lg hover:shadow-purple-500/10 transition-shadow duration-300">
                <h4 className="text-lg font-bold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[hsl(var(--primary))]" />
                  Order Timeline
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[hsl(var(--muted-foreground))]">Order Placed</span>
                    <span className="font-semibold text-[hsl(var(--foreground))]">
                      {new Date(selectedOrder.createdAt).toLocaleString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}

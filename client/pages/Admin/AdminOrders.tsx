import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminHeader from "@/components/AdminHeader";
import Footer from "@/components/Footer";
import ConnectWallet from "@/components/ConnectWallet";
import { useWallet } from "@/contexts/WalletContext";
import { getOrders, isAdminWallet, updateOrderStatus } from "@/lib/storefront";
import type { OrderStatus } from "@/lib/storefront";
import { Download, Package, CreditCard, Calendar, ChevronDown } from "lucide-react";

const orderStatusOptions: OrderStatus[] = [
  "pending",
  "processing",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
];

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  processing: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  paid: "bg-green-500/15 text-green-700 border-green-500/30",
  shipped: "bg-purple-500/15 text-purple-700 border-purple-500/30",
  delivered: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  cancelled: "bg-red-500/15 text-red-700 border-red-500/30",
};

function escapeCsv(value: string | number) {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export default function AdminOrders() {
  const { isConnected, walletAddress } = useWallet();
  const [refreshTick, setRefreshTick] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const isAdmin = isAdminWallet(walletAddress);
  const orders = useMemo(() => getOrders(), [refreshTick]);

  // Filter by custom date range if both dates are selected.
  const ordersByTimePeriod = useMemo(() => {
    if (customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);

      return orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    return orders;
  }, [orders, customStartDate, customEndDate]);

  // Filter by search term
  const filteredOrders = ordersByTimePeriod.filter(order =>
    order.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.deliveryDetails.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    setRefreshTick(v => v + 1);
  };

  const handleExportCsv = () => {
    if (ordersByTimePeriod.length === 0) {
      alert("No orders to export.");
      return;
    }

    const header = [
      "order_id",
      "created_at",
      "wallet_address",
      "item_name",
      "collection_name",
      "color",
      "quantity",
      "unit_price",
      "total",
      "payment_method",
      "status",
      "full_name",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "postal_code",
      "country",
    ];

    const rows = ordersByTimePeriod.map((order) => [
      order.id,
      order.createdAt,
      order.walletAddress,
      order.itemName,
      order.collectionName,
      order.color,
      order.quantity,
      order.unitPrice.toFixed(2),
      order.total.toFixed(2),
      order.paymentMethod,
      order.status,
      order.deliveryDetails.fullName,
      order.deliveryDetails.email,
      order.deliveryDetails.phone,
      order.deliveryDetails.address,
      order.deliveryDetails.city,
      order.deliveryDetails.state,
      order.deliveryDetails.postalCode,
      order.deliveryDetails.country,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((value) => escapeCsv(value ?? "")).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <AdminHeader />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-[hsl(var(--muted-foreground))] mb-6">Connect wallet to continue.</p>
          <ConnectWallet />
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <AdminHeader />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-red-500">Access denied.</p>
        </main>
      </div>
    );
  }

  const totalRevenue = ordersByTimePeriod.reduce((sum, order) => sum + order.total, 0);
  const paymentLinkOrders = ordersByTimePeriod.filter(o => o.paymentMethod === "payment-link").length;
  const paymentLinkRevenue = ordersByTimePeriod.filter(o => o.paymentMethod === "payment-link").reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--card))]/30">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="group relative p-3 hover:bg-gradient-to-br hover:from-[hsl(var(--primary))]/10 hover:to-[hsl(var(--primary))]/5 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/40 transition-all duration-300"
              title="Back to Dashboard"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary))]/60 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
              <svg className="relative w-6 h-6 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-[hsl(var(--foreground))]">Orders</h1>
              <p className="text-[hsl(var(--muted-foreground))] mt-1">Manage and track customer orders</p>
            </div>
          </div>
          <button
            onClick={handleExportCsv}
            disabled={ordersByTimePeriod.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-xl font-semibold hover:border-[hsl(var(--primary))] transition disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <section className="space-y-6">
          {/* Custom Range Filter */}
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-semibold">Custom Range</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-2 font-semibold">From</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                />
              </div>
              <div>
                <label className="block text-xs text-[hsl(var(--muted-foreground))] mb-2 font-semibold">To</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setCustomStartDate("");
                    setCustomEndDate("");
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--card))] transition text-sm font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>


          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Total Orders */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase">Total Orders</p>
                  <p className="text-3xl font-bold text-[hsl(var(--foreground))] mt-2">{ordersByTimePeriod.length}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase">Total Revenue</p>
                  <p className="text-3xl font-bold text-[hsl(var(--foreground))] mt-2">${totalRevenue.toFixed(2)}</p>
                </div>
                <div className="w-8 h-8 text-green-500 flex items-center justify-center">
                  <span className="text-2xl font-bold">$</span>
                </div>
              </div>
            </div>

            {/* Payment Link Orders */}
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] uppercase">Payment Link</p>
                  <p className="text-3xl font-bold text-[hsl(var(--foreground))] mt-2">{paymentLinkOrders}</p>
                  <p className="text-xs text-orange-600 font-semibold mt-1">${paymentLinkRevenue.toFixed(2)}</p>
                </div>
                <CreditCard className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        </section>

        {/* Search */}
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-4">
          <input
            type="text"
            placeholder="Search by item name, wallet, or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
          />
        </div>

        {/* Orders List */}
        <section className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-12 text-center">
              <Package className="w-12 h-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4 opacity-50" />
              <p className="text-[hsl(var(--muted-foreground))]">
                {orders.length === 0 ? "No orders yet" : "No orders match your search"}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-gradient-to-br from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--primary))]/5 border border-[hsl(var(--border))] rounded-2xl p-6 hover:border-[hsl(var(--primary))]/50 hover:shadow-xl transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedOrderId((prev) => (prev === order.id ? null : order.id))
                  }
                  className="w-full text-left"
                  aria-expanded={expandedOrderId === order.id}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">{order.itemName}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold border ${statusColors[order.status]} uppercase tracking-wide`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        #{order.id.slice(-8)} • {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-6">
                      <div className="text-right">
                        <p className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-green-500 bg-clip-text text-transparent">
                          ${order.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] font-semibold uppercase tracking-wide">
                          {order.paymentMethod || "payment-link"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--muted-foreground))]">
                        {expandedOrderId === order.id ? "Hide details" : "View details"}
                        <ChevronDown
                          className={`w-5 h-5 transition-transform duration-300 ${
                            expandedOrderId === order.id ? "rotate-180 text-[hsl(var(--primary))]" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </button>

                {expandedOrderId === order.id && (
                  <div className="mt-6 space-y-6 border-t border-[hsl(var(--border))]/60 pt-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-[hsl(var(--background))]/50 rounded-xl p-4 border border-[hsl(var(--border))]/50">
                        <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2 font-bold">Quantity</p>
                        <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{order.quantity}</p>
                      </div>
                      <div className="bg-[hsl(var(--background))]/50 rounded-xl p-4 border border-[hsl(var(--border))]/50">
                        <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2 font-bold">Color</p>
                        <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{order.color}</p>
                      </div>
                      <div className="bg-[hsl(var(--background))]/50 rounded-xl p-4 border border-[hsl(var(--border))]/50">
                        <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2 font-bold">Unit Price</p>
                        <p className="text-2xl font-bold text-[hsl(var(--foreground))]">${order.unitPrice.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-[hsl(var(--background))]/50 rounded-xl p-5 border border-[hsl(var(--border))]/50">
                        <h4 className="text-sm font-bold text-[hsl(var(--primary))] uppercase mb-4 tracking-wide">Customer Info</h4>
                        <div className="space-y-2.5 text-sm">
                          <p className="font-semibold text-[hsl(var(--foreground))]">{order.deliveryDetails.fullName}</p>
                          <p className="text-[hsl(var(--muted-foreground))]">{order.deliveryDetails.email}</p>
                          <p className="text-[hsl(var(--muted-foreground))]">{order.deliveryDetails.phone}</p>
                          <div className="pt-2 border-t border-[hsl(var(--border))]/30">
                            <p className="text-[10px] text-[hsl(var(--muted-foreground))]/60 uppercase tracking-wider mb-1 font-bold">Wallet Address</p>
                            <p className="text-xs font-mono text-[hsl(var(--primary))] bg-[hsl(var(--background))] px-3 py-2 rounded-lg border border-[hsl(var(--primary))]/20 break-all">
                              {order.walletAddress}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[hsl(var(--background))]/50 rounded-xl p-5 border border-[hsl(var(--border))]/50">
                        <h4 className="text-sm font-bold text-[hsl(var(--primary))] uppercase mb-4 tracking-wide">Delivery Address</h4>
                        <div className="space-y-2 text-sm text-[hsl(var(--foreground))]">
                          <p className="font-medium">{order.deliveryDetails.address}</p>
                          <p>{order.deliveryDetails.city}, {order.deliveryDetails.state} {order.deliveryDetails.postalCode}</p>
                          <p className="font-semibold text-[hsl(var(--primary))]">{order.deliveryDetails.country}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-[hsl(var(--foreground))] uppercase tracking-wide mb-3">Update Order Status</label>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className="w-full px-5 py-3 rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] font-semibold focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 transition-all"
                      >
                        {orderStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

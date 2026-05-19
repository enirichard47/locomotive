import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
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
import { getOrders } from "../lib/storefront";
import type { StoreOrder, OrderStatus } from "../lib/storefront";
import { getUserSettings } from "@/lib/user";
import {
  appendNotification,
  DELIVERY_STATUSES,
  STATUS_SNAPSHOT_KEY_PREFIX,
} from "@/lib/notifications";

const isImageSource = (value?: string) =>
  Boolean(value && (value.startsWith("/") || value.startsWith("http")));

const formatOrderDateTime = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return "Payment pending";
    case "paid":
      return "Payment confirmed";
    case "processing":
      return "Preparing shipment";
    case "shipped":
      return "In transit";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
};

const ORDER_PROGRESS_STEPS: Array<{ key: OrderStatus; label: string }> = [
  { key: "paid", label: "Payment confirmed" },
  { key: "processing", label: "Preparing shipment" },
  { key: "shipped", label: "In transit" },
  { key: "delivered", label: "Delivered" },
];

const getOrderProgressIndex = (status: OrderStatus) => {
  switch (status) {
    case "paid":
      return 0;
    case "processing":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
      return 3;
    default:
      return -1;
  }
};

export default function Dashboard() {
  const { walletAddress } = useWallet();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!walletAddress) {
      setDisplayName("");
      return;
    }

    const settings = getUserSettings(walletAddress);
    setDisplayName(settings.displayName.trim());
  }, [walletAddress]);

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      if (!walletAddress) {
        if (mounted) {
          setOrders([]);
          setIsLoadingOrders(false);
        }
        return;
      }

      setIsLoadingOrders(true);
      setOrdersError(null);

      try {
        const rows = await getOrders(walletAddress);
        if (mounted) {
          setOrders(rows);
        }
      } catch (error) {
        if (mounted) {
          setOrders([]);
          setOrdersError(error instanceof Error ? error.message : "Failed to load orders.");
        }
      } finally {
        if (mounted) {
          setIsLoadingOrders(false);
        }
      }
    };

    loadOrders();

    return () => {
      mounted = false;
    };
  }, [walletAddress]);

  useEffect(() => {
    if (!walletAddress || isLoadingOrders) {
      return;
    }

    const settings = getUserSettings(walletAddress);
    const snapshotKey = `${STATUS_SNAPSHOT_KEY_PREFIX}${walletAddress.toLowerCase()}`;
    const currentSnapshot = Object.fromEntries(orders.map((order) => [order.id, order.status]));

    let previousSnapshot: Record<string, OrderStatus> | null = null;
    try {
      const raw = window.localStorage.getItem(snapshotKey);
      previousSnapshot = raw ? (JSON.parse(raw) as Record<string, OrderStatus>) : null;
    } catch {
      previousSnapshot = null;
    }

    if (!previousSnapshot) {
      window.localStorage.setItem(snapshotKey, JSON.stringify(currentSnapshot));
      return;
    }

    for (const order of orders) {
      const previousStatus = previousSnapshot[order.id];
      if (!previousStatus || previousStatus === order.status) {
        continue;
      }

      if (DELIVERY_STATUSES.includes(order.status)) {
        if (settings.deliveryAlerts) {
          toast.success(`Delivery update: ${order.itemName} is now ${order.status}.`);
          appendNotification(walletAddress, {
            id: crypto.randomUUID(),
            orderId: order.id,
            itemName: order.itemName,
            status: order.status,
            kind: "delivery",
            createdAt: new Date().toISOString(),
          });
        }
      } else if (settings.orderAlerts) {
        toast.message(`Order update: ${order.itemName} is now ${order.status}.`);
        appendNotification(walletAddress, {
          id: crypto.randomUUID(),
          orderId: order.id,
          itemName: order.itemName,
          status: order.status,
          kind: "order",
          createdAt: new Date().toISOString(),
        });
      }
    }

    window.localStorage.setItem(snapshotKey, JSON.stringify(currentSnapshot));
  }, [walletAddress, orders, isLoadingOrders]);

  useEffect(() => {
    const orderId = searchParams.get("order");
    if (!orderId || orders.length === 0) {
      return;
    }

    const matchedOrder = orders.find((order) => order.id === orderId);
    if (!matchedOrder) {
      return;
    }

    setSelectedOrder(matchedOrder);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("order");
      return next;
    }, { replace: true });
  }, [orders, searchParams, setSearchParams]);

  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0),
    [orders],
  );
  const inTransitCount = useMemo(
    () => orders.filter((o) => o.status === "shipped" || o.status === "processing").length,
    [orders],
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
      case "paid":
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
      case "paid":
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "cancelled":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 pt-32">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[hsl(var(--primary))]/10 rounded-2xl flex items-center justify-center text-[hsl(var(--primary))] shadow-sm border border-[hsl(var(--primary))]/20">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))]">
                  Account Dashboard
                </h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-1">
                  Welcome back, <span className="font-medium text-[hsl(var(--foreground))]">{displayName || `${walletAddress?.slice(0, 8)}...${walletAddress?.slice(-6)}`}</span>
                </p>
              </div>
            </div>
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-medium rounded-xl hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5 transition-all duration-300 shadow-sm"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </div>
        </div>

        {/* Standard Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Total Orders</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[hsl(var(--foreground))]">{orders.length}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">Lifetime</span>
            </div>
          </div>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Total Spent</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[hsl(var(--foreground))]">${totalSpent.toFixed(2)}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">USD</span>
            </div>
          </div>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">In Transit</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[hsl(var(--foreground))]">{inTransitCount}</span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">Active</span>
            </div>
          </div>
        </div>

        {/* Orders List Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Order History</h2>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 md:flex-none">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders..."
                  className="w-full md:w-64 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:outline-none transition-all"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 transition-all"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
              <button
                onClick={handleExportOrders}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-xl text-sm font-medium hover:border-[hsl(var(--primary))] transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {isLoadingOrders ? (
            <div className="py-20 text-center bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl">
              <div className="w-8 h-8 border-2 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[hsl(var(--muted-foreground))]">Loading your history...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl border-dashed">
              <Package className="w-12 h-12 text-[hsl(var(--muted-foreground))]/30 mx-auto mb-4" />
              <p className="text-[hsl(var(--muted-foreground))] text-lg font-medium">No orders found</p>
              <Link to="/merch-designs" className="text-[hsl(var(--primary))] font-medium hover:underline mt-2 inline-block">
                Browse our collections
              </Link>
            </div>
          ) : (
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[hsl(var(--muted))]/30 border-b border-[hsl(var(--border))]">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Order</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Date</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Total</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--border))]">
                    {filteredOrders.map((order) => (
                      <tr 
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="hover:bg-[hsl(var(--muted))]/10 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[hsl(var(--muted))] rounded-lg flex items-center justify-center overflow-hidden border border-[hsl(var(--border))]">
                              {isImageSource(order.image) ? (
                                <img src={order.image} alt={order.itemName} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-2xl">{order.image ?? "👕"}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-[hsl(var(--foreground))]">{order.itemName}</p>
                              <p className="text-xs text-[hsl(var(--muted-foreground))]">{order.collectionName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm text-[hsl(var(--foreground))]">{formatOrderDateTime(order.createdAt).split(",")[0]}</p>
                          <p className="text-[10px] font-mono text-[hsl(var(--muted-foreground))]">ID: {order.id.slice(0, 8)}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {getStatusLabel(order.status)}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-bold text-[hsl(var(--foreground))]">${order.total.toFixed(2)}</p>
                          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">Qty: {order.quantity}</p>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-all">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Standard Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-[hsl(var(--card))]/95 backdrop-blur-md border-b border-[hsl(var(--border))] p-6 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Product Info */}
              <div className="flex gap-6 items-start">
                <div className="w-24 h-24 bg-[hsl(var(--muted))] rounded-xl border border-[hsl(var(--border))] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {isImageSource(selectedOrder.image) ? (
                    <img src={selectedOrder.image} alt={selectedOrder.itemName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">{selectedOrder.image ?? "👕"}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">{selectedOrder.itemName}</h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">{selectedOrder.collectionName} Collection</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-[hsl(var(--foreground))]">${selectedOrder.total.toFixed(2)}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{selectedOrder.quantity} item(s)</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <span className="px-2 py-1 bg-[hsl(var(--muted))] rounded text-xs font-medium border border-[hsl(var(--border))] capitalize">Color: {selectedOrder.color}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Order Status</h4>
                <div className="flex items-center gap-2">
                  {ORDER_PROGRESS_STEPS.map((step, index) => {
                    const activeIndex = getOrderProgressIndex(selectedOrder.status);
                    const isDone = activeIndex >= index;
                    return (
                      <div key={step.key} className="flex-1 flex items-center gap-2">
                        <div className={`h-1.5 flex-1 rounded-full ${isDone ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--muted))]"}`} />
                        {index < ORDER_PROGRESS_STEPS.length - 1 && <div className="w-1 h-1 rounded-full bg-[hsl(var(--border))]" />}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between">
                   <p className="text-xs text-[hsl(var(--muted-foreground))] font-medium">Currently: <span className="text-[hsl(var(--foreground))]">{getStatusLabel(selectedOrder.status)}</span></p>
                   <p className="text-xs text-[hsl(var(--muted-foreground))]">{formatOrderDateTime(selectedOrder.createdAt)}</p>
                </div>
              </div>

              {/* Delivery & Shipping */}
              <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-[hsl(var(--border))]">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Shipping Address</h4>
                  <div className="space-y-1 text-sm">
                    <p className="font-bold text-[hsl(var(--foreground))]">{selectedOrder.deliveryDetails.fullName}</p>
                    <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                      {selectedOrder.deliveryDetails.address}<br />
                      {selectedOrder.deliveryDetails.city}, {selectedOrder.deliveryDetails.state} {selectedOrder.deliveryDetails.postalCode}<br />
                      {selectedOrder.deliveryDetails.country}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Shipment Details</h4>
                  <div className="space-y-3">
                    {selectedOrder.redspeed?.waybillNumber ? (
                      <div className="p-3 bg-[hsl(var(--muted))]/50 rounded-lg border border-[hsl(var(--border))]">
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase font-bold tracking-wider mb-1">Waybill Number</p>
                        <p className="font-mono text-sm text-[hsl(var(--primary))] font-bold">{selectedOrder.redspeed.waybillNumber}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-[hsl(var(--muted-foreground))] italic">Shipment tracking will be available once processed.</p>
                    )}
                    {selectedOrder.redspeed?.trackingStatus && (
                      <div className="flex items-start gap-2 text-sm">
                        <Truck className="w-4 h-4 text-[hsl(var(--muted-foreground))] mt-0.5" />
                        <p className="text-[hsl(var(--muted-foreground))]">{selectedOrder.redspeed.trackingStatus}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="pt-8 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 -mx-8 px-8 py-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[hsl(var(--muted-foreground))]">Items ({selectedOrder.quantity})</span>
                    <span className="text-[hsl(var(--foreground))] font-medium">${(selectedOrder.unitPrice * selectedOrder.quantity).toFixed(2)}</span>
                  </div>
                  {typeof selectedOrder.redspeed?.deliveryFee === "number" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[hsl(var(--muted-foreground))]">Shipping Fee</span>
                      <span className="text-[hsl(var(--foreground))] font-medium">${selectedOrder.redspeed.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-[hsl(var(--border))] flex justify-between">
                    <span className="text-lg font-bold text-[hsl(var(--foreground))]">Total Amount</span>
                    <span className="text-lg font-bold text-[hsl(var(--primary))]">${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}

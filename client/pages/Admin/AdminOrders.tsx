import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminHeader from "@/components/AdminHeader";
import Footer from "@/components/Footer";
import ConnectWallet from "@/components/ConnectWallet";
import { useWallet } from "@/contexts/WalletContext";
import { clearAllOrders, getOrders, updateOrderStatus, resendRedspeedPickup } from "../../lib/storefront";
import type { OrderStatus, StoreOrder } from "../../lib/storefront";
import { Download, Package, CreditCard, Calendar as CalendarIcon, ChevronDown, AlertTriangle, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const orderStatusOptions: OrderStatus[] = [
  "pending",
  "processing",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
];

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-250",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  paid: "bg-emerald-50 text-emerald-800 border-emerald-250",
  shipped: "bg-purple-50 text-purple-700 border-purple-200",
  delivered: "bg-gray-900 text-white border-black",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

function escapeCsv(value: string | number) {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function formatDateForFilterLabel(date?: Date) {
  if (!date) {
    return "Select date";
  }

  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatOrderDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeWaybillNumber(value?: string) {
  const normalized = (value || "").trim().toLowerCase();
  if (!normalized || ["n/a", "na", "none", "null", "-", "--"].includes(normalized)) {
    return "";
  }

  return normalized;
}

function shouldShowRedspeedRetry(order: StoreOrder) {
  const waybillNumber = normalizeWaybillNumber(order.redspeed?.waybillNumber);
  const shipmentPayloadText = (() => {
    if (typeof order.redspeed?.shipmentPayload === "string") {
      return order.redspeed.shipmentPayload;
    }

    try {
      return JSON.stringify(order.redspeed?.shipmentPayload ?? "");
    } catch {
      return "";
    }
  })().toLowerCase();

  const trackingStatusText = (order.redspeed?.trackingStatus || "").toLowerCase();
  const hasPickupFailure =
    /pickup request failed|insufficient fund|insufficient funds|failed|error/.test(trackingStatusText) ||
    /pickup request failed|insufficient fund|insufficient funds|failed|error/.test(shipmentPayloadText);

  const needsPickupRetry = !waybillNumber || hasPickupFailure;
  const isActionableOrder = order.status === "paid" || order.status === "processing";

  return isActionableOrder && needsPickupRetry;
}

function getPickupFailureReason(order: StoreOrder): string | null {
  const trackingStatusText = (order.redspeed?.trackingStatus || "").toLowerCase();
  const shipmentPayloadText = (() => {
    if (typeof order.redspeed?.shipmentPayload === "string") return order.redspeed.shipmentPayload as string;
    try {
      return JSON.stringify(order.redspeed?.shipmentPayload ?? "");
    } catch {
      return "";
    }
  })().toLowerCase();

  if (/insufficient fund|insufficient funds/.test(trackingStatusText) || /insufficient fund|insufficient funds/.test(shipmentPayloadText)) {
    return "Insufficient funds for pickup request";
  }

  if (/pickup request failed|failed|error/.test(trackingStatusText) || /pickup request failed|failed|error/.test(shipmentPayloadText)) {
    return "Pickup request failed (provider error)";
  }

  return null;
}

export default function AdminOrders() {
  const { isConnected, isAdmin } = useWallet();
  const currentYear = new Date().getFullYear();
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);
  const [startMonth, setStartMonth] = useState(new Date());
  const [endMonth, setEndMonth] = useState(new Date());
  const [startYearInput, setStartYearInput] = useState(String(currentYear));
  const [endYearInput, setEndYearInput] = useState(String(currentYear));
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [overrideEnabledByOrder, setOverrideEnabledByOrder] = useState<Record<string, boolean>>({});
  const [isClearingOrders, setIsClearingOrders] = useState(false);
  const [isResendingByOrder, setIsResendingByOrder] = useState<Record<string, boolean>>({});

  const refreshOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const nextOrders = await getOrders();
      setOrders(nextOrders);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to load orders.");
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  const applyYearToMonth = (value: string, setMonth: React.Dispatch<React.SetStateAction<Date>>) => {
    const sanitizedYear = value.replace(/\D/g, "").slice(0, 4);
    if (sanitizedYear.length !== 4) {
      return;
    }

    const year = Number(sanitizedYear);
    if (Number.isNaN(year)) {
      return;
    }

    const boundedYear = Math.min(9999, Math.max(1000, year));
    setMonth((prev) => new Date(boundedYear, prev.getMonth(), 1));
  };

  const handleYearInputChange = (
    value: string,
    setYearInput: React.Dispatch<React.SetStateAction<string>>,
    setMonth: React.Dispatch<React.SetStateAction<Date>>,
  ) => {
    const sanitizedYear = value.replace(/\D/g, "").slice(0, 4);
    setYearInput(sanitizedYear);
    applyYearToMonth(sanitizedYear, setMonth);
  };

  // Filter by custom date range if both dates are selected.
  const ordersByTimePeriod = useMemo(() => {
    if (customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      startDate.setHours(0, 0, 0, 0);
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

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    const shouldProceed = window.confirm(
      "This will manually override API-driven order status updates for this order. Continue?",
    );

    if (!shouldProceed) {
      return;
    }

    try {
      await updateOrderStatus(orderId, status);
      setOverrideEnabledByOrder((prev) => ({ ...prev, [orderId]: false }));
      await refreshOrders();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update order status.");
    }
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

  const handleClearAllOrders = async () => {
    const shouldProceed = window.confirm(
      "This will permanently delete every order and start the store fresh. Continue?",
    );

    if (!shouldProceed) {
      return;
    }

    try {
      setIsClearingOrders(true);
      await clearAllOrders();
      setExpandedOrderId(null);
      await refreshOrders();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to clear all orders.");
    } finally {
      setIsClearingOrders(false);
    }
  };

  const handleResendPickup = async (orderId: string) => {
    if (!window.confirm("Retry RedSpeed pickup for this order?")) return;
    try {
      setIsResendingByOrder((p) => ({ ...p, [orderId]: true }));
      await resendRedspeedPickup(orderId);
      await refreshOrders();
      alert("Resend attempted — order updated.");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to resend pickup");
    } finally {
      setIsResendingByOrder((p) => ({ ...p, [orderId]: false }));
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
        <AdminHeader />
        <main className="flex-1 flex items-center justify-center max-w-xl mx-auto w-full px-4 py-28 text-center">
          <div className="border border-[hsl(var(--border))] bg-white p-12 text-center shadow-sm w-full">
            <p className="text-gray-500 font-serif italic text-sm mb-6">Connect wallet to continue.</p>
            <ConnectWallet />
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
        <AdminHeader />
        <main className="flex-1 flex items-center justify-center max-w-xl mx-auto w-full px-4 py-28 text-center">
          <div className="border border-red-500/20 bg-red-500/[0.02] p-12 text-center w-full">
            <p className="text-red-500 font-serif text-sm">Access denied.</p>
          </div>
        </main>
      </div>
    );
  }

  const totalRevenue = ordersByTimePeriod.reduce((sum, order) => sum + order.total, 0);
  const paymentLinkOrders = ordersByTimePeriod.filter(o => o.paymentMethod === "payment-link").length;
  const paymentLinkRevenue = ordersByTimePeriod.filter(o => o.paymentMethod === "payment-link").reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="min-h-screen flex flex-col bg-white text-[hsl(var(--foreground))]">
      <AdminHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Editorial Subheader */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between pb-10 border-b border-gray-100 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Link
                to="/admin"
                className="group flex items-center justify-center w-10 h-10 border border-gray-100 hover:border-black transition-colors"
                title="Back to System overview"
              >
                <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
              </Link>
              <div className="w-[1px] h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-[hsl(var(--primary))]">Fulfillment log</span>
              </div>
            </div>

            <h1 className="font-serif text-5xl font-bold uppercase tracking-tighter text-black">
              Store <span className="italic font-light">Orders</span>
            </h1>
            <p className="text-gray-500 font-serif italic text-base max-w-xl leading-relaxed">
              Track customer purchases, review shipping metadata, trigger waybill pickup integrations, and perform custom audits.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleClearAllOrders}
              disabled={isClearingOrders || orders.length === 0}
              className="px-6 py-3 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-red-50 transition disabled:opacity-50"
            >
              {isClearingOrders ? "Clearing..." : "Reset All Orders"}
            </button>
            <button
              onClick={handleExportCsv}
              disabled={ordersByTimePeriod.length === 0}
              className="px-6 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[hsl(var(--primary))] transition-all duration-300 disabled:opacity-50"
            >
              Export CSV Ledger
            </button>
          </div>
        </div>

        {isLoadingOrders && (
          <div className="border border-gray-100 p-8 text-center text-xs uppercase tracking-widest font-bold text-gray-400">
            Fetching order records...
          </div>
        )}

        {/* Date Filter & Stats Grid */}
        <section className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Custom Range Filter */}
          <div className="lg:col-span-4 border border-gray-100 p-6 space-y-4">
            <div className="flex items-center gap-2 text-black border-b border-gray-50 pb-2">
              <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Date Filters</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">From Date</label>
                <Popover open={isStartCalendarOpen} onOpenChange={setIsStartCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between px-3 py-2 text-xs h-auto rounded-none border-gray-150 bg-white text-black hover:bg-gray-50"
                    >
                      <span>{formatDateForFilterLabel(customStartDate)}</span>
                      <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3 rounded-none" align="start">
                    <div className="mb-3">
                      <label className="mb-1 block text-xs font-semibold text-[hsl(var(--muted-foreground))]">Year</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={startYearInput}
                        onChange={(e) => handleYearInputChange(e.target.value, setStartYearInput, setStartMonth)}
                        className="w-full border border-[hsl(var(--border))] bg-white px-3 py-2 text-xs outline-none focus:border-black"
                      />
                    </div>
                    <Calendar
                      mode="single"
                      month={startMonth}
                      onMonthChange={(month) => {
                        setStartMonth(month);
                        setStartYearInput(String(month.getFullYear()));
                      }}
                      selected={customStartDate}
                      onSelect={(date) => {
                        setCustomStartDate(date);
                        if (date) {
                          setStartMonth(date);
                          setStartYearInput(String(date.getFullYear()));
                          setIsStartCalendarOpen(false);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">To Date</label>
                <Popover open={isEndCalendarOpen} onOpenChange={setIsEndCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between px-3 py-2 text-xs h-auto rounded-none border-gray-150 bg-white text-black hover:bg-gray-50"
                    >
                      <span>{formatDateForFilterLabel(customEndDate)}</span>
                      <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3 rounded-none" align="start">
                    <div className="mb-3">
                      <label className="mb-1 block text-xs font-semibold text-[hsl(var(--muted-foreground))]">Year</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={endYearInput}
                        onChange={(e) => handleYearInputChange(e.target.value, setEndYearInput, setEndMonth)}
                        className="w-full border border-[hsl(var(--border))] bg-white px-3 py-2 text-xs outline-none focus:border-black"
                      />
                    </div>
                    <Calendar
                      mode="single"
                      month={endMonth}
                      onMonthChange={(month) => {
                        setEndMonth(month);
                        setEndYearInput(String(month.getFullYear()));
                      }}
                      selected={customEndDate}
                      onSelect={(date) => {
                        setCustomEndDate(date);
                        if (date) {
                          setEndMonth(date);
                          setEndYearInput(String(date.getFullYear()));
                          setIsEndCalendarOpen(false);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {(customStartDate || customEndDate) && (
                <button
                  onClick={() => {
                    const resetDate = new Date();
                    setCustomStartDate(undefined);
                    setCustomEndDate(undefined);
                    setStartMonth(resetDate);
                    setEndMonth(resetDate);
                    setStartYearInput(String(resetDate.getFullYear()));
                    setEndYearInput(String(resetDate.getFullYear()));
                    setIsStartCalendarOpen(false);
                    setIsEndCalendarOpen(false);
                  }}
                  className="w-full py-2 border border-gray-150 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition"
                >
                  Clear Range
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="lg:col-span-8 grid sm:grid-cols-3 border border-gray-100 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 shadow-sm">
            {/* Total Orders */}
            <div className="p-8 hover:bg-gray-50/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Total volume</span>
                <Package className="w-3.5 h-3.5 text-gray-300" />
              </div>
              <p className="font-slab text-4xl font-bold text-black">{ordersByTimePeriod.length}</p>
              <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold mt-1">Receipts in range</p>
            </div>

            {/* Total Revenue */}
            <div className="p-8 hover:bg-gray-50/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Gross revenue</span>
                <span className="text-xs font-bold text-gray-300">$</span>
              </div>
              <p className="font-slab text-4xl font-bold text-black">${totalRevenue.toFixed(2)}</p>
              <p className="text-[8px] text-gray-400 uppercase tracking-widest font-bold mt-1">Accumulated earnings</p>
            </div>

            {/* Payment Link Orders */}
            <div className="p-8 hover:bg-gray-50/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Card checkout</span>
                <CreditCard className="w-3.5 h-3.5 text-gray-300" />
              </div>
              <p className="font-slab text-4xl font-bold text-black">{paymentLinkOrders}</p>
              <p className="text-[8px] text-[hsl(var(--primary))] uppercase tracking-widest font-bold mt-1">
                ${paymentLinkRevenue.toFixed(2)} settled
              </p>
            </div>
          </div>
        </section>

        {/* Search */}
        <div className="relative border border-gray-100 flex items-center bg-white">
          <div className="pl-4">
            <Search className="w-4 h-4 text-gray-300" />
          </div>
          <input
            type="text"
            placeholder="Search catalog orders by product title, Solana wallet signature, or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-4 text-xs outline-none text-black placeholder-gray-300"
          />
        </div>

        {/* Orders List */}
        <section className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="border border-gray-100 py-16 text-center space-y-3">
              <Package className="w-8 h-8 text-gray-300 mx-auto opacity-50" />
              <p className="text-xs uppercase tracking-widest font-bold text-gray-400">
                {orders.length === 0 ? "No purchases logged yet" : "No orders matching query"}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-100 bg-white p-6 hover:shadow-md transition-all duration-300 space-y-4"
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
                        <h3 className="font-serif text-2xl font-bold text-black tracking-tight">{order.itemName}</h3>
                        
                        <span className={`text-[8px] font-bold tracking-widest px-2.5 py-0.5 border ${statusColors[order.status] || "border-gray-200 text-gray-600"} uppercase`}>
                          {order.status}
                        </span>

                        {(() => {
                          const failureReason = getPickupFailureReason(order);
                          const waybill = normalizeWaybillNumber(order.redspeed?.waybillNumber);
                          const isMissingPickup = !failureReason && !waybill && (order.status === "paid" || order.status === "processing");

                          if (failureReason) {
                            return (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 text-[8px] bg-red-50 text-red-700 border border-red-150 px-2 py-0.5 font-bold uppercase tracking-wider"
                                    aria-label="Pickup failure details"
                                  >
                                    <AlertTriangle className="w-2.5 h-2.5" />
                                    Pickup Fail
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[20rem] p-4 rounded-none border-gray-200 bg-white">
                                  <div className="text-xs space-y-2">
                                    <p className="font-bold text-red-700">{failureReason}</p>
                                    <p className="text-[10px] text-gray-400">Waybill: {waybill || "—"}</p>
                                    <pre className="text-[10px] bg-gray-50 border border-gray-100 rounded p-2 max-h-40 overflow-auto">
{JSON.stringify(order.redspeed?.shipmentPayload ?? order.redspeed?.trackingStatus ?? "", null, 2)}
                                    </pre>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            );
                          }

                          if (isMissingPickup) {
                            return (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1.5 text-[8px] bg-amber-50 text-amber-700 border border-amber-150 px-2 py-0.5 font-bold uppercase tracking-wider"
                                    aria-label="Pickup missing details"
                                  >
                                    Pickup Missing
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[20rem] p-4 rounded-none border-gray-200 bg-white">
                                  <div className="text-xs space-y-2">
                                    <p className="font-bold text-amber-700">No active waybill allocated for this paid order</p>
                                    <p className="text-[10px] text-gray-400">Waybill: {waybill || "—"}</p>
                                    <pre className="text-[10px] bg-gray-50 border border-gray-100 rounded p-2 max-h-40 overflow-auto">
{JSON.stringify(order.redspeed?.shipmentPayload ?? order.redspeed?.trackingStatus ?? "", null, 2)}
                                    </pre>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            );
                          }

                          return null;
                        })()}
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                        ID: {order.id.slice(-8)} • CURATED ON {formatOrderDateTime(order.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-serif text-2xl italic text-[hsl(var(--primary))]">
                          ${order.total.toFixed(2)}
                        </p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                          via {order.paymentMethod || "card link"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition">
                        <span>{expandedOrderId === order.id ? "Close Details" : "Expand"}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-300 ${
                            expandedOrderId === order.id ? "rotate-180 text-black" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </button>

                {shouldShowRedspeedRetry(order) && (
                  <div className="pt-2 flex justify-end border-t border-gray-50">
                    <button
                      type="button"
                      onClick={() => handleResendPickup(order.id)}
                      disabled={Boolean(isResendingByOrder[order.id])}
                      className="px-5 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[hsl(var(--primary))] transition-all duration-300 disabled:opacity-50"
                    >
                      {isResendingByOrder[order.id] ? "Requesting..." : "Resend Waybill Pickup Request"}
                    </button>
                  </div>
                )}

                {expandedOrderId === order.id && (
                  <div className="pt-6 border-t border-gray-100 space-y-6">
                    <div className="grid grid-cols-3 border border-gray-100 divide-x divide-gray-100 text-center">
                      <div className="py-4">
                        <span className="block text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">Quantity</span>
                        <span className="font-serif text-xl font-bold text-black">{order.quantity}</span>
                      </div>
                      <div className="py-4">
                        <span className="block text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">Color Option</span>
                        <span className="font-serif text-xl font-bold text-black">{order.color}</span>
                      </div>
                      <div className="py-4">
                        <span className="block text-[8px] font-bold uppercase tracking-widest text-gray-400 mb-1">Unit Price</span>
                        <span className="font-serif text-xl font-bold text-black">${order.unitPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-2">
                      <div className="border border-gray-100 p-5 bg-gray-50/20">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-black block mb-4 border-b border-gray-100 pb-2">
                          Customer Credentials
                        </span>
                        <div className="space-y-1.5 text-xs text-gray-500">
                          <p className="font-bold text-black">{order.deliveryDetails.fullName}</p>
                          <p>{order.deliveryDetails.email}</p>
                          <p>{order.deliveryDetails.phone}</p>
                          <div className="pt-4 mt-2 border-t border-gray-100">
                            <span className="block text-[7px] text-gray-400 uppercase tracking-wider mb-1 font-bold">Solana Wallet Identity</span>
                            <p className="text-[10px] font-mono text-black break-all select-all">
                              {order.walletAddress}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-100 p-5 bg-gray-50/20">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-black block mb-4 border-b border-gray-100 pb-2">
                          Shipping Destination
                        </span>
                        <div className="space-y-1.5 text-xs text-gray-500 font-light">
                          <p className="font-medium text-black">{order.deliveryDetails.address}</p>
                          <p>{order.deliveryDetails.city}, {order.deliveryDetails.state} {order.deliveryDetails.postalCode}</p>
                          <p className="font-bold text-black uppercase tracking-wider mt-1">{order.deliveryDetails.country}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-gray-50">
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-black">Manual override state</span>
                      <div className="border border-amber-100 bg-amber-50/20 p-4 text-xs text-amber-700 flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                        <p className="leading-relaxed">
                          For testing and edge case overrides only. Live checkout flows automatically drive webhook updates from the delivery partners and stripe hooks.
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`override-toggle-${order.id}`}
                          checked={Boolean(overrideEnabledByOrder[order.id])}
                          onChange={(e) =>
                            setOverrideEnabledByOrder((prev) => ({
                              ...prev,
                              [order.id]: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 accent-black"
                        />
                        <label htmlFor={`override-toggle-${order.id}`} className="text-xs text-black font-medium select-none">
                          Unlock manual selector for this ledger
                        </label>
                      </div>

                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        disabled={!overrideEnabledByOrder[order.id]}
                        className="w-full px-4 py-3 border border-gray-150 outline-none text-xs text-black font-bold uppercase tracking-wider bg-white focus:border-black disabled:opacity-50 transition"
                      >
                        {orderStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status.toUpperCase()}
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

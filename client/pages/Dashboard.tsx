import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
} from "lucide-react";
import Header from "@/components/Header";
import { useWallet } from "@/contexts/WalletContext";
import { Order, OrderListResponse } from "@shared/api";

const isImageSource = (value?: string) =>
  Boolean(value && (value.startsWith("/") || value.startsWith("http")));

export default function Dashboard() {
  const { walletAddress } = useWallet();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { data, isLoading, isError } = useQuery<OrderListResponse>({
    queryKey: ["orders", walletAddress],
    queryFn: async () => {
      const response = await fetch(
        `/api/orders?wallet=${encodeURIComponent(walletAddress ?? "")}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      return response.json();
    },
    enabled: Boolean(walletAddress),
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (data) {
      setLastUpdated(new Date());
    }
  }, [data]);

  const orders = data?.orders ?? [];
  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + order.price * order.quantity, 0),
    [orders]
  );
  const inTransitCount = useMemo(
    () => orders.filter((o) => o.status === "shipped" || o.status === "processing").length,
    [orders]
  );

  const getStatusColor = (status: Order["status"]) => {
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

  const getStatusIcon = (status: Order["status"]) => {
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

  const getStatusLabel = (status: Order["status"]) => {
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
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-2">
            Dashboard
          </h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Welcome back, {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
          </p>
          {lastUpdated && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6">
            <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">
              Total Orders
            </h3>
            <p className="text-3xl font-bold text-[hsl(var(--primary))]">
              {orders.length}
            </p>
          </div>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6">
            <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">
              Total Spent
            </h3>
            <p className="text-3xl font-bold text-[hsl(var(--primary))]">
              ${totalSpent.toFixed(2)}
            </p>
          </div>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6">
            <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">
              In Transit
            </h3>
            <p className="text-3xl font-bold text-[hsl(var(--primary))]">
              {inTransitCount}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[hsl(var(--card))] to-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-lg p-8 mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
                Create New Design
              </h2>
              <p className="text-[hsl(var(--muted-foreground))]">
                Design and order your next custom piece
              </p>
            </div>
            <Link
              to="/identity-engineering"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] transition"
            >
              Create Design
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-6">
            Your Orders
          </h2>

          <div className="space-y-4">
            {isLoading && (
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6 text-[hsl(var(--muted-foreground))]">
                Loading orders...
              </div>
            )}
            {isError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-red-500">
                Unable to load orders right now. Please refresh.
              </div>
            )}
            {!isLoading && !isError && orders.length === 0 && (
              <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6 text-[hsl(var(--muted-foreground))]">
                You have no orders yet. Start engineering your first design.
              </div>
            )}

            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6 hover:border-[hsl(var(--primary))] transition"
              >
                <div className="grid md:grid-cols-4 gap-6 items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[hsl(var(--background))] rounded-lg flex items-center justify-center text-3xl border border-[hsl(var(--border))]">
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
                      <h3 className="font-bold text-[hsl(var(--foreground))]">
                        {order.itemName}
                      </h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {order.collectionName}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1">
                      Order ID
                    </p>
                    <p className="font-mono text-sm text-[hsl(var(--foreground))]">
                      {order.id}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                      Ordered: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2">
                      Status
                    </p>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status)}
                    </div>
                    {order.estimatedDelivery && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                        Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1">
                      Total
                    </p>
                    <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                      ${(order.price * order.quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {order.quantity} × ${order.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

import { useWallet } from "@/contexts/WalletContext";
import { Link } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
} from "lucide-react";
import Header from "@/components/Header";

interface Order {
  id: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  design: string;
  clothingType: string;
  price: number;
  estimatedDelivery?: string;
  image: string;
}

export default function Dashboard() {
  const { walletAddress, disconnect } = useWallet();

  // Mock order data - in a real app, this would come from an API
  const orders: Order[] = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "delivered",
      design: "Combat Street",
      clothingType: "Oversized Hoodie",
      price: 49.99,
      estimatedDelivery: "2024-01-22",
      image: "👕",
    },
    {
      id: "ORD-002",
      date: "2024-01-18",
      status: "shipped",
      design: "Minimal Typography",
      clothingType: "T-Shirt",
      price: 29.99,
      estimatedDelivery: "2024-01-25",
      image: "👕",
    },
    {
      id: "ORD-003",
      date: "2024-01-20",
      status: "processing",
      design: "Neon Vibe",
      clothingType: "Sweatshirt",
      price: 59.99,
      estimatedDelivery: "2024-01-27",
      image: "👕",
    },
  ];

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle2 className="w-5 h-5" />;
      case "shipped":
        return <Truck className="w-5 h-5" />;
      case "processing":
        return <Clock className="w-5 h-5" />;
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "cancelled":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status: string) => {
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-2">
            Dashboard
          </h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Welcome back, {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
          </p>
        </div>

        {/* Quick Actions */}
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
              ${orders.reduce((sum, order) => sum + order.price, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6">
            <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">
              In Transit
            </h3>
            <p className="text-3xl font-bold text-[hsl(var(--primary))]">
              {orders.filter((o) => o.status === "shipped" || o.status === "processing")
                .length}
            </p>
          </div>
        </div>

        {/* Create New Order CTA */}
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
              to="/custom-made"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] transition"
            >
              Create Design
            </Link>
          </div>
        </div>

        {/* Orders Section */}
        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-6">
            Your Orders
          </h2>

          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6 hover:border-[hsl(var(--primary))] transition"
              >
                <div className="grid md:grid-cols-4 gap-6 items-center">
                  {/* Order Image */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[hsl(var(--background))] rounded-lg flex items-center justify-center text-3xl border border-[hsl(var(--border))]">
                      {order.image}
                    </div>
                    <div>
                      <h3 className="font-bold text-[hsl(var(--foreground))]">
                        {order.design}
                      </h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {order.clothingType}
                      </p>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1">
                      Order ID
                    </p>
                    <p className="font-mono text-sm text-[hsl(var(--foreground))]">
                      {order.id}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                      Ordered: {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Status */}
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
                        Est. Delivery:{" "}
                        {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1">
                      Price
                    </p>
                    <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                      ${order.price.toFixed(2)}
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

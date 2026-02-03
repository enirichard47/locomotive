import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const { isConnected, walletAddress } = useWallet();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  const itemName = searchParams.get("item") || "Custom Design";
  const collectionName = searchParams.get("collection") || "Merch";
  const itemPrice = parseFloat(searchParams.get("price") || "49.99");
  const itemIcon = searchParams.get("icon") || "👕";

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = ["Black", "White", "Navy", "Gray"];
  const [selectedColor, setSelectedColor] = useState("Black");

  const total = itemPrice * quantity;

  const handlePlaceOrder = () => {
    if (!isConnected) {
      alert("Please connect your wallet to complete the purchase");
      return;
    }

    setOrderPlaced(true);
    setTimeout(() => {
      setOrderPlaced(false);
    }, 3000);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <Header />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 rounded-full mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mb-4">
            Your order has been confirmed. You'll receive a confirmation email shortly.
          </p>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mb-8">
            Wallet: {walletAddress?.slice(0, 10)}...{walletAddress?.slice(-8)}
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-8 py-3 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Link
            to={collectionName === "Merch" ? "/merch" : "/custom-made"}
            className="p-2 hover:bg-[hsl(var(--card))] rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-[hsl(var(--primary))]" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
              Checkout
            </h1>
            <p className="text-[hsl(var(--muted-foreground))]">
              {collectionName} Collection
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Details */}
          <div>
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-8 mb-8">
              <div className="flex items-center justify-center aspect-square bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--background))] rounded-lg mb-6">
                <span className="text-7xl">{itemIcon}</span>
              </div>
              <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
                {itemName}
              </h2>
              <p className="text-[hsl(var(--muted-foreground))] mb-6">
                Premium quality streetwear from our {collectionName} collection
              </p>

              {/* Size Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-[hsl(var(--foreground))] mb-3">
                  Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 px-4 rounded-lg border-2 font-medium transition capitalize ${
                        selectedSize === size
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                          : "border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-[hsl(var(--foreground))] mb-3">
                  Color
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`py-2 px-4 rounded-lg border-2 font-medium transition ${
                        selectedColor === color
                          ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                          : "border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))]"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-bold text-[hsl(var(--foreground))] mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--card))] transition font-bold"
                  >
                    −
                  </button>
                  <span className="text-xl font-bold text-[hsl(var(--foreground))] min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--card))] transition font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-8 sticky top-24">
              <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-6">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-[hsl(var(--border))]">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">
                    {itemName}
                  </span>
                  <span className="font-medium text-[hsl(var(--foreground))]">
                    ${itemPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(var(--muted-foreground))]">
                    Size: {selectedSize}
                  </span>
                  <span className="text-[hsl(var(--muted-foreground))]">
                    Color: {selectedColor}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(var(--muted-foreground))]">
                    Quantity: {quantity}
                  </span>
                  <span className="text-[hsl(var(--muted-foreground))]">
                    Subtotal: ${(itemPrice * quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Shipping</span>
                  <span className="text-[hsl(var(--foreground))] font-medium">
                    $10.00
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">Tax</span>
                  <span className="text-[hsl(var(--foreground))] font-medium">
                    ${(total * 0.08).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-[hsl(var(--background))] rounded-lg p-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-[hsl(var(--foreground))] font-bold">
                    Total
                  </span>
                  <span className="text-3xl font-bold text-[hsl(var(--primary))]">
                    ${(total + 10 + total * 0.08).toFixed(2)}
                  </span>
                </div>
              </div>

              {isConnected ? (
                <>
                  <button
                    onClick={handlePlaceOrder}
                    className="w-full py-3 px-6 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] transition mb-3"
                  >
                    Complete Purchase
                  </button>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
                    Wallet: {walletAddress?.slice(0, 10)}...{walletAddress?.slice(-8)}
                  </p>
                </>
              ) : (
                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <p className="text-sm text-orange-500 font-medium">
                    Please connect your wallet to complete the purchase
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

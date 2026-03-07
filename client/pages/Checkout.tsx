import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Wallet } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import ConnectWallet from "@/components/ConnectWallet";
import { useWallet } from "@/contexts/WalletContext";
import { saveOrder } from "@/lib/storefront";
import type { DeliveryDetails } from "@shared/api";

const PAYMENT_LINK =
  "https://www.dogemeatpay.info/pay/checkout/dm-e4e801eea036eteg/69ab191bff220edfc8786ce1?product=69ab1999ff220edfc8786cfb&ref=ref_2fa923bc75f07622";

const HATE_CAP_REGULAR_PRICE = 22;
const HATE_CAP_DISCOUNTED_PRICE = 11;

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const { isConnected, walletAddress } = useWallet();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const quantity = 1;
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const itemName = searchParams.get("item") || "Custom Design";
  const collectionName = searchParams.get("collection") || "Merch";
  const itemPrice = parseFloat(searchParams.get("price") || "49.99");
  const itemIcon = searchParams.get("icon") || "👕";
  const itemImage = searchParams.get("image") || undefined;
  const isMerchOrder = ["Merch", "Hate", "Manga"].includes(collectionName);
  const backLink = isMerchOrder ? "/merch-designs" : "/identity-engineering";

  const isHateCapPromo =
    /hate/i.test(collectionName) || /hate\s*cap/i.test(itemName);
  const unitPrice = isHateCapPromo ? HATE_CAP_DISCOUNTED_PRICE : itemPrice;
  const regularUnitPrice = isHateCapPromo ? HATE_CAP_REGULAR_PRICE : itemPrice;
  const discountPerItem = regularUnitPrice - unitPrice;
  const subtotal = unitPrice * quantity;
  
  // Free delivery within Lagos
  const isLagos = deliveryDetails.city.toLowerCase().trim() === "lagos";
  const shipping = isLagos ? 0 : 10;
  
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  const isDeliveryDetailsComplete = Object.values(deliveryDetails).every(
    (value) => value.trim().length > 0,
  );

  const updateDeliveryField = (field: keyof DeliveryDetails, value: string) => {
    setDeliveryDetails((prev) => ({ ...prev, [field]: value }));
  };

  const buildPaymentMetadata = () => ({
    itemName,
    collectionName,
    quantity,
    selectedColor,
    unitPrice,
    subtotal,
    shipping,
    tax,
    total,
    deliveryDetails,
  });

  const ensureDeliveryDetails = () => {
    if (isDeliveryDetailsComplete) {
      return true;
    }

    alert("Please fill in all delivery details before payment.");
    return false;
  };

  const ensureWalletConnected = () => {
    if (isConnected) {
      return true;
    }

    alert("Connect your wallet to continue with payment.");
    return false;
  };

  const handlePaymentLinkCheckout = () => {
    if (!ensureWalletConnected()) {
      return;
    }

    if (!ensureDeliveryDetails()) {
      return;
    }

    const orderId = `ord_${crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;
    const metadata = buildPaymentMetadata();
    localStorage.setItem("checkout_delivery_details", JSON.stringify(metadata));
    saveOrder({
      id: orderId,
      walletAddress: walletAddress ?? "",
      itemName,
      collectionName,
      image: itemImage ?? itemIcon,
      color: selectedColor,
      quantity,
      unitPrice,
      total,
      paymentMethod: "payment-link",
      status: "pending",
      createdAt: new Date().toISOString(),
      deliveryDetails,
    });

    const paymentUrl = new URL(PAYMENT_LINK);
    paymentUrl.searchParams.set("customer_email", deliveryDetails.email);
    paymentUrl.searchParams.set("customer_name", deliveryDetails.fullName);
    paymentUrl.searchParams.set("amount", unitPrice.toFixed(2));
    paymentUrl.searchParams.set("quantity", String(quantity));
    paymentUrl.searchParams.set("color", selectedColor);

    if (isHateCapPromo) {
      paymentUrl.searchParams.set("promo", "hate-cap-50-off");
      paymentUrl.searchParams.set("regular_price", HATE_CAP_REGULAR_PRICE.toFixed(2));
      paymentUrl.searchParams.set("discounted_price", HATE_CAP_DISCOUNTED_PRICE.toFixed(2));
    }

    window.location.assign(paymentUrl.toString());
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
            Payment Submitted Successfully!
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mb-4">
            Your payment has been confirmed. You'll receive a confirmation email shortly.
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
            to={backLink}
            className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
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

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6">
            <div className="flex items-center justify-center aspect-[4/3] bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--background))] rounded-lg mb-6 overflow-hidden">
              {itemImage ? (
                <img
                  src={itemImage}
                  alt={itemName}
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-7xl">{itemIcon}</span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">
              {itemName}
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] mb-4">
              Premium quality streetwear from our {collectionName} collection
            </p>

            <div className="mb-6 p-4 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[hsl(var(--muted-foreground))]">Price</span>
                <span className="text-xl font-bold text-[hsl(var(--primary))]">
                  ${unitPrice.toFixed(2)}
                </span>
              </div>
              {isHateCapPromo && (
                <div className="flex items-center justify-between mt-1 text-sm">
                  <span className="text-green-500">Hate Cap 50% Discount</span>
                  <span className="text-[hsl(var(--muted-foreground))] line-through">
                    ${HATE_CAP_REGULAR_PRICE.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-[hsl(var(--foreground))] mb-3">
                Color
              </label>
              <input
                type="text"
                placeholder="Enter color (e.g., Black, White, Navy)"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:border-[hsl(var(--primary))] focus:outline-none transition"
              />
            </div>
          </div>

          {!isConnected ? (
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 text-orange-500 mb-4">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">
                Connect Wallet to Continue
              </h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-5">
                Delivery details and payment options will appear after you connect your wallet.
              </p>
              <ConnectWallet />
            </div>
          ) : (
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg p-6">
              <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-6">
                Delivery Details
              </h3>

              <div className="grid grid-cols-1 gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={deliveryDetails.fullName}
                  onChange={(event) => updateDeliveryField("fullName", event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={deliveryDetails.email}
                  onChange={(event) => updateDeliveryField("email", event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={deliveryDetails.phone}
                  onChange={(event) => updateDeliveryField("phone", event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                />
                <input
                  type="text"
                  placeholder="Street Address"
                  value={deliveryDetails.address}
                  onChange={(event) => updateDeliveryField("address", event.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={deliveryDetails.city}
                    onChange={(event) => updateDeliveryField("city", event.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={deliveryDetails.state}
                    onChange={(event) => updateDeliveryField("state", event.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={deliveryDetails.postalCode}
                    onChange={(event) => updateDeliveryField("postalCode", event.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={deliveryDetails.country}
                    onChange={(event) => updateDeliveryField("country", event.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                  />
                </div>
              </div>

              {/* Order Summary */}
              {isDeliveryDetailsComplete && (
                <div className="mb-6 p-5 rounded-xl bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--card))] border-2 border-[hsl(var(--border))]">
                  <h4 className="text-sm font-bold text-[hsl(var(--foreground))] uppercase tracking-wide mb-4">Order Summary</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
                      <span className="font-semibold text-[hsl(var(--foreground))]">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[hsl(var(--muted-foreground))]">Shipping</span>
                      {isLagos ? (
                        <span className="font-bold text-green-500 flex items-center gap-2">
                          FREE
                          <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">Lagos</span>
                        </span>
                      ) : (
                        <span className="font-semibold text-[hsl(var(--foreground))]">${shipping.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[hsl(var(--muted-foreground))]">Tax (8%)</span>
                      <span className="font-semibold text-[hsl(var(--foreground))]">${tax.toFixed(2)}</span>
                    </div>
                    <div className="pt-3 border-t-2 border-[hsl(var(--border))] flex items-center justify-between">
                      <span className="text-base font-bold text-[hsl(var(--foreground))] uppercase">Total</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-green-500 bg-clip-text text-transparent">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {isLagos && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-xs text-green-700 font-semibold">
                        🎉 Free delivery within Lagos! You save $10.00
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!isDeliveryDetailsComplete && (
                <p className="text-sm text-orange-500 mb-3">
                  Complete all delivery fields to unlock payment options.
                </p>
              )}

              <button
                onClick={handlePaymentLinkCheckout}
                className="w-full py-3 px-6 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isSubmitting || !isDeliveryDetailsComplete || !selectedColor.trim()}
              >
                Complete Payment
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

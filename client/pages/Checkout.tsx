import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Wallet } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import ConnectWallet from "@/components/ConnectWallet";
import { useWallet } from "@/contexts/WalletContext";
import type { DeliveryDetails } from "@shared/api";
import { getDefaultSettings, getUserSettings, saveUserSettings, type UserSettings } from "@/lib/user";

const HATE_CAP_PRICE = 0.1;
const DEFAULT_CAP_PACKED_WEIGHT_KG = 0.3;

type RedspeedCity = {
  id?: number;
  abbr?: string;
  name?: string;
};

type RedspeedTown = {
  id?: number;
  cityId?: number;
  abbr?: string;
  name?: string;
};

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const { isConnected, walletAddress } = useWallet();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capColor, setCapColor] = useState("");
  const [hateColor, setHateColor] = useState("");
  const [userSettings, setUserSettings] = useState<UserSettings>(getDefaultSettings());
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [saveAsDefaultAddress, setSaveAsDefaultAddress] = useState(false);
  const [showCheckoutConfirmation, setShowCheckoutConfirmation] = useState(false);
  const [redspeedCities, setRedspeedCities] = useState<RedspeedCity[]>([]);
  const [redspeedTowns, setRedspeedTowns] = useState<RedspeedTown[]>([]);
  const [selectedCityCode, setSelectedCityCode] = useState("");
  const [selectedTownId, setSelectedTownId] = useState<number | null>(null);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isLoadingTowns, setIsLoadingTowns] = useState(false);
  const [isCalculatingDeliveryFee, setIsCalculatingDeliveryFee] = useState(false);
  const [deliveryFeeUsd, setDeliveryFeeUsd] = useState<number | null>(null);
  const [deliveryFeeNgn, setDeliveryFeeNgn] = useState<number | null>(null);
  const [fxRateNgnPerUsd, setFxRateNgnPerUsd] = useState<number | null>(null);
  const [deliveryFeeRetryTick, setDeliveryFeeRetryTick] = useState(0);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [paymentSyncError, setPaymentSyncError] = useState<string | null>(null);
  const [isSyncingPayment, setIsSyncingPayment] = useState(false);
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
      let shouldResetSubmitting = true;
  const itemPrice = parseFloat(searchParams.get("price") || "49.99");
  const itemIcon = searchParams.get("icon") || "👕";
  const itemImage = searchParams.get("image") || undefined;
  const isMerchOrder = ["Merch", "Hate", "Manga"].includes(collectionName);
  const backLink = isMerchOrder ? "/merch-designs" : "/identity-engineering";

  const isHateCapPromo =
    /hate/i.test(collectionName) || /hate\s*cap/i.test(itemName);
  const unitPrice = isHateCapPromo ? HATE_CAP_PRICE : itemPrice;
  const subtotal = unitPrice * quantity;

  const tax = 0;
  const shipping = deliveryFeeUsd ?? 0;
  const total = subtotal + shipping;
  const selectedColor = isHateCapPromo
    ? `${capColor.trim()} / ${hateColor.trim()}`.replace(/^\s*\/\s*|\s*\/\s*$/g, "")
    : capColor.trim();
  const isColorSelectionComplete = isHateCapPromo
    ? Boolean(capColor.trim()) && Boolean(hateColor.trim())
    : Boolean(capColor.trim());
  const isDeliveryDetailsComplete = Object.values(deliveryDetails).every(
    (value) => value.trim().length > 0,
  );
  const recipientCityForRedspeed = selectedCityCode.trim();
  const filteredRedspeedCities = redspeedCities.filter((city) => {
    const abbr = typeof city.abbr === "string" ? city.abbr.trim() : "";
    const name = typeof city.name === "string" ? city.name.trim() : "";
    return Boolean(abbr || name);
  });
  const canCalculateDeliveryFee =
    isConnected &&
    Boolean(recipientCityForRedspeed) &&
    selectedTownId !== null &&
    deliveryDetails.state.trim().length > 0 &&
    deliveryDetails.country.trim().length > 0;
  const isDeliveryFeeReady = !isCalculatingDeliveryFee && deliveryFeeUsd !== null;

  const toUserFriendlyLocationError = (error: unknown) => {
    const fallback = "Failed to calculate RedSpeed delivery fee.";
    if (!(error instanceof Error)) {
      return fallback;
    }

    const message = error.message || fallback;
    if (/temporarily unreachable|fetch failed|network|unable to connect/i.test(message)) {
      return "Delivery provider is temporarily unavailable. Please retry in a moment.";
    }

    return message;
  };

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      setOrderPlaced(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      setOrderPlaced(true);
    }
  }, [searchParams]);

  const updateDeliveryField = (field: keyof DeliveryDetails, value: string) => {
    setDeliveryDetails((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    let mounted = true;

    const loadCities = async () => {
      if (!isConnected) {
        return;
      }

      setIsLoadingLocations(true);
      setLocationError(null);

      try {
        const response = await fetch("/api/delivery/redspeed/cities", {
          credentials: "include",
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error || "Failed to load RedSpeed cities.");
        }

        const payload = (await response.json()) as { cities?: RedspeedCity[] };
        if (mounted) {
          setRedspeedCities(payload.cities || []);
        }
      } catch (error) {
        if (mounted) {
          setLocationError(error instanceof Error ? error.message : "Failed to load RedSpeed cities.");
          setRedspeedCities([]);
        }
      } finally {
        if (mounted) {
          setIsLoadingLocations(false);
        }
      }
    };

    loadCities();

    return () => {
      mounted = false;
    };
  }, [isConnected]);

  useEffect(() => {
    let mounted = true;

    const loadTowns = async () => {
      if (!selectedCityCode) {
        setRedspeedTowns([]);
        setSelectedTownId(null);
        setIsLoadingTowns(false);
        return;
      }

      setIsLoadingTowns(true);
      setLocationError(null);

      try {
        const response = await fetch(`/api/delivery/redspeed/towns/${encodeURIComponent(selectedCityCode)}`, {
          credentials: "include",
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error || "Failed to load RedSpeed towns.");
        }

        const payload = (await response.json()) as { towns?: RedspeedTown[] };
        if (mounted) {
          setRedspeedTowns(payload.towns || []);
          setSelectedTownId(null);
        }
      } catch (error) {
        if (mounted) {
          setLocationError(error instanceof Error ? error.message : "Failed to load RedSpeed towns.");
          setRedspeedTowns([]);
          setSelectedTownId(null);
        }
      } finally {
        if (mounted) {
          setIsLoadingTowns(false);
        }
      }
    };

    loadTowns();

    return () => {
      mounted = false;
    };
  }, [selectedCityCode]);

  useEffect(() => {
    let mounted = true;

    const calculateDeliveryFee = async () => {
      if (!canCalculateDeliveryFee) {
        setDeliveryFeeUsd(null);
        setDeliveryFeeNgn(null);
        setFxRateNgnPerUsd(null);
        setIsCalculatingDeliveryFee(false);
        return;
      }

      setIsCalculatingDeliveryFee(true);
      setLocationError(null);

      try {
        const response = await fetch("/api/delivery/redspeed/fee", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            recipientCity: recipientCityForRedspeed,
            recipientTownID: selectedTownId,
            weight: DEFAULT_CAP_PACKED_WEIGHT_KG,
          }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error || "Failed to calculate RedSpeed delivery fee.");
        }

        const payload = (await response.json()) as {
          deliveryFee?: number;
          deliveryFeeNgn?: number;
          fxRateNgnPerUsd?: number;
        };
        if (mounted) {
          const nextUsdFee = Number(payload.deliveryFee);
          const nextNgnFee = Number(payload.deliveryFeeNgn);
          const nextFxRate = Number(payload.fxRateNgnPerUsd);

          setDeliveryFeeUsd(Number.isFinite(nextUsdFee) ? nextUsdFee : null);
          setDeliveryFeeNgn(Number.isFinite(nextNgnFee) ? nextNgnFee : null);
          setFxRateNgnPerUsd(Number.isFinite(nextFxRate) ? nextFxRate : null);
        }
      } catch (error) {
        if (mounted) {
          setLocationError(toUserFriendlyLocationError(error));
          setDeliveryFeeUsd(null);
          setDeliveryFeeNgn(null);
          setFxRateNgnPerUsd(null);
        }
      } finally {
        if (mounted) {
          setIsCalculatingDeliveryFee(false);
        }
      }
    };

    calculateDeliveryFee();

    return () => {
      mounted = false;
    };
  }, [canCalculateDeliveryFee, recipientCityForRedspeed, selectedTownId, quantity, deliveryFeeRetryTick]);

  useEffect(() => {
    if (!walletAddress) {
      setUserSettings(getDefaultSettings());
      setUseSavedAddress(true);
      return;
    }

    const nextSettings = getUserSettings(walletAddress);
    setUserSettings(nextSettings);
    setUseSavedAddress(nextSettings.useSavedAddressByDefault);

    if (nextSettings.useSavedAddressByDefault) {
      setDeliveryDetails(nextSettings.defaultDeliveryDetails);
      setSelectedCityCode("");
      setSelectedTownId(null);
    }
  }, [walletAddress, redspeedCities]);

  const applySavedAddress = () => {
    setDeliveryDetails(userSettings.defaultDeliveryDetails);
    setSelectedCityCode("");
    setSelectedTownId(null);
  };

  const clearAddressForm = () => {
    setDeliveryDetails({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    });
    setSelectedCityCode("");
    setSelectedTownId(null);
  };

  const buildPaymentMetadata = () => ({
    orderId: undefined as string | undefined,
    walletAddress: walletAddress ?? "",
    itemName,
    collectionName,
    image: itemImage ?? itemIcon,
    quantity,
    selectedColor,
    colors: isHateCapPromo
      ? { capColor: capColor.trim(), hateColor: hateColor.trim() }
      : { capColor: capColor.trim() },
    unitPrice,
    subtotal,
    shipping,
    tax,
    total,
    deliveryDetails,
    deliveryFeeUsd,
    deliveryFeeNgn,
    fxRateNgnPerUsd,
    shippingWeightKg: DEFAULT_CAP_PACKED_WEIGHT_KG,
    redspeed: {
      recipientCity: selectedCityCode,
      recipientTownId: selectedTownId ?? undefined,
    },
  });

  const ensureDeliveryDetails = () => {
    if (isDeliveryDetailsComplete) {
      if (!selectedCityCode) {
        alert("Please select a RedSpeed city before payment.");
        return false;
      }
      if (selectedTownId === null) {
        alert("Please select a RedSpeed delivery town before payment.");
        return false;
      }
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

  const handlePaymentLinkCheckout = async (confirmed = false) => {
    if (!ensureWalletConnected()) {
      return;
    }

    if (!ensureDeliveryDetails()) {
      return;
    }

    try {
      setIsSubmitting(true);
      let shouldResetSubmitting = true;

      const latestSettings = walletAddress ? getUserSettings(walletAddress) : userSettings;
      setUserSettings(latestSettings);

      if (latestSettings.requireCheckoutConfirmation && !confirmed) {
        setShowCheckoutConfirmation(true);
        setIsSubmitting(false);
        return;
      }

      setShowCheckoutConfirmation(false);

      if (walletAddress) {
        saveUserSettings(walletAddress, {
          ...latestSettings,
          useSavedAddressByDefault: useSavedAddress,
          defaultDeliveryDetails: saveAsDefaultAddress
            ? deliveryDetails
            : latestSettings.defaultDeliveryDetails,
        });
      }

      const orderId = `ord_${crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;
      const metadata = {
        ...buildPaymentMetadata(),
        orderId,
        walletAddress: walletAddress ?? "",
      };
      localStorage.setItem("checkout_delivery_details", JSON.stringify(metadata));

      const response = await fetch("/api/payments/dogemeatpay/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          idempotencyKey: orderId,
          amount: total,
          currency: "USD",
          productName: itemName,
          redirectUrl: `${window.location.origin}/payment/return?payment=success&orderId=${encodeURIComponent(orderId)}`,
          metadata: {
            orderId,
            walletAddress: walletAddress ?? "",
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
            deliveryFeeUsd,
            deliveryFeeNgn,
            fxRateNgnPerUsd,
            shippingWeightKg: DEFAULT_CAP_PACKED_WEIGHT_KG,
            redspeed: {
              recipientCity: selectedCityCode,
              recipientTownId: selectedTownId ?? undefined,
              deliveryFee: deliveryFeeUsd ?? undefined,
            },
            promo: isHateCapPromo ? "hate-cap-50-off" : undefined,
          },
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "Failed to create Dogemeat Pay session.");
      }

      const session = (await response.json()) as { checkoutUrl?: string; sessionId?: string };

      if (!session.checkoutUrl) {
        throw new Error("Dogemeat Pay did not return a checkout URL.");
      }

      if (session.sessionId) {
        const existingSessionsRaw = localStorage.getItem("checkout_payment_sessions");
        const existingSessions = existingSessionsRaw ? (JSON.parse(existingSessionsRaw) as Record<string, string>) : {};
        existingSessions[orderId] = session.sessionId;
        localStorage.setItem("checkout_payment_sessions", JSON.stringify(existingSessions));
      }

      shouldResetSubmitting = false;
      window.location.assign(session.checkoutUrl);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to start payment checkout.");
    } finally {
      if (shouldResetSubmitting) {
        setIsSubmitting(false);
      }
    }
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
          {(isSyncingPayment || paymentSyncError) && (
            <div className="mb-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 text-left">
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                {isSyncingPayment ? "Syncing payment status..." : "Payment status sync warning"}
              </p>
              {paymentSyncError && <p className="mt-1 text-sm text-orange-500">{paymentSyncError}</p>}
            </div>
          )}
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
                <div className="mt-1 text-sm text-green-500">Hate Cap Special Price</div>
              )}
            </div>

            <div>
              {isHateCapPromo ? (
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-[hsl(var(--foreground))] mb-3">
                    Colors
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      type="text"
                      placeholder="Cap color (e.g., Black)"
                      value={capColor}
                      onChange={(e) => setCapColor(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:border-[hsl(var(--primary))] focus:outline-none transition"
                    />
                    <input
                      type="text"
                      placeholder="Hate color (e.g., Red)"
                      value={hateColor}
                      onChange={(e) => setHateColor(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:border-[hsl(var(--primary))] focus:outline-none transition"
                    />
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    First enter the cap color, then the hate color.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-[hsl(var(--foreground))] mb-3">
                    Color
                  </label>
                  <input
                    type="text"
                    placeholder="Enter color (e.g., Black, White, Navy)"
                    value={capColor}
                    onChange={(e) => setCapColor(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:border-[hsl(var(--primary))] focus:outline-none transition"
                  />
                </div>
              )}
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

              <div className="mb-5 p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--foreground))]">
                  <input
                    type="checkbox"
                    checked={useSavedAddress}
                    onChange={(event) => {
                      const nextValue = event.target.checked;
                      setUseSavedAddress(nextValue);
                      if (nextValue) {
                        applySavedAddress();
                      }
                    }}
                  />
                  Use saved address from settings
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={applySavedAddress}
                    className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-sm"
                  >
                    Apply Saved Address
                  </button>
                  <button
                    type="button"
                    onClick={clearAddressForm}
                    className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-sm"
                  >
                    Clear Fields
                  </button>
                </div>

                <label className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                  <input
                    type="checkbox"
                    checked={saveAsDefaultAddress}
                    onChange={(event) => setSaveAsDefaultAddress(event.target.checked)}
                  />
                  Save this checkout address as my default
                </label>
              </div>

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
                  {filteredRedspeedCities.length > 0 ? (
                    <select
                      value={selectedCityCode}
                      onChange={(event) => {
                        const code = event.target.value;
                        setSelectedCityCode(code);
                        setLocationError(null);
                        const matchedCity = filteredRedspeedCities.find(
                          (city) => (city.abbr || city.name || "").trim() === code,
                        );
                        updateDeliveryField("city", matchedCity?.name?.trim() || "");
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                      disabled={isLoadingLocations}
                    >
                      <option value="">
                        {isLoadingLocations ? "Loading cities..." : "Select City"}
                      </option>
                      {filteredRedspeedCities.map((city) => {
                        const value = (city.abbr || city.name || "").trim();
                        const label = city.name || value;
                        return (
                          <option key={`${value}-${city.id || ""}`} value={value}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="City"
                      value={deliveryDetails.city}
                      onChange={(event) => updateDeliveryField("city", event.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                    />
                  )}
                  <input
                    type="text"
                    placeholder="State"
                    value={deliveryDetails.state}
                    onChange={(event) => updateDeliveryField("state", event.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                  />
                </div>
                <select
                  value={selectedTownId ?? ""}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setSelectedTownId(nextValue ? Number(nextValue) : null);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]"
                  disabled={!selectedCityCode || isLoadingTowns}
                >
                  <option value="">
                    {!selectedCityCode
                      ? "Select a city first"
                      : isLoadingTowns
                        ? "Loading towns..."
                        : redspeedTowns.length === 0
                          ? "No towns returned"
                          : "Select Delivery Town"}
                  </option>
                  {redspeedTowns.map((town) => (
                    <option key={`${town.id || ""}-${town.name || ""}`} value={town.id || ""}>
                      {town.name || town.abbr || "Town"}
                    </option>
                  ))}
                </select>
                {locationError && (
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-orange-500">{locationError}</p>
                    <button
                      type="button"
                      onClick={() => setDeliveryFeeRetryTick((prev) => prev + 1)}
                      disabled={!canCalculateDeliveryFee || isCalculatingDeliveryFee}
                      className="text-xs px-2 py-1 rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] disabled:opacity-50"
                    >
                      Retry fee
                    </button>
                  </div>
                )}
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
                      <span className="font-semibold text-[hsl(var(--foreground))]">
                        {isCalculatingDeliveryFee
                          ? "Calculating..."
                          : deliveryFeeUsd !== null
                            ? `$${shipping.toFixed(2)}`
                            : "Pending quote"}
                      </span>
                    </div>
                    <div className="pt-3 border-t-2 border-[hsl(var(--border))] flex items-center justify-between">
                      <span className="text-base font-bold text-[hsl(var(--foreground))] uppercase">Total</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-green-500 bg-clip-text text-transparent">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {selectedColor && (
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                      {isHateCapPromo ? (
                        <>
                          <span className="px-3 py-1 rounded-full bg-[hsl(var(--background))] border border-[hsl(var(--border))]">Cap: {capColor.trim()}</span>
                          <span className="px-3 py-1 rounded-full bg-[hsl(var(--background))] border border-[hsl(var(--border))]">Hate: {hateColor.trim()}</span>
                        </>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-[hsl(var(--background))] border border-[hsl(var(--border))]">Color: {capColor.trim()}</span>
                      )}
                    </div>
                  )}
                  {deliveryFeeUsd !== null && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-xs text-green-700 font-semibold">
                        Delivery fee calculated by RedSpeed for this address.
                        {deliveryFeeNgn !== null ? ` (NGN ${deliveryFeeNgn.toLocaleString("en-NG")})` : ""}
                        {fxRateNgnPerUsd !== null ? ` at FX ${fxRateNgnPerUsd.toLocaleString("en-US")}.` : ""}
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

              {showCheckoutConfirmation && userSettings.requireCheckoutConfirmation && (
                <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
                  <p className="text-sm font-semibold text-amber-700 mb-3">
                    Final review: confirm these delivery details before payment redirect.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handlePaymentLinkCheckout(true)}
                      disabled={isSubmitting}
                      className="px-3 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold disabled:opacity-60"
                    >
                      Confirm and Continue
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCheckoutConfirmation(false)}
                      disabled={isSubmitting}
                      className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => handlePaymentLinkCheckout()}
                className="w-full py-3 px-6 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold rounded-lg hover:bg-[hsl(130_99%_60%)] transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={
                  isSubmitting ||
                  !isDeliveryDetailsComplete ||
                  !isColorSelectionComplete ||
                  !isDeliveryFeeReady
                }
              >
                {isCalculatingDeliveryFee ? "Calculating Delivery Fee..." : "Complete Payment"}
              </button>
            </div>
          )}

      </div>
      </div>

      <Footer />
    </div>
  );
}

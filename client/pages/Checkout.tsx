import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Wallet, ArrowRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import ConnectWallet from "@/components/ConnectWallet";
import { useWallet } from "@/contexts/WalletContext";
import type { DeliveryDetails } from "@shared/api";
import { getDefaultSettings, getUserSettings, saveUserSettings, type UserSettings } from "@/lib/user";
import { apiFetch } from "@/lib/storefront";

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

const resolveCollectionSlug = (collectionName: string) => {
  const normalized = collectionName.trim().toLowerCase();

  if (normalized === "8" || normalized === "eight") {
    return "eight";
  }

  return normalized.replace(/\s+/g, "-");
};

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const { isConnected, walletAddress } = useWallet();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isTownOpen, setIsTownOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [townSearch, setTownSearch] = useState("");
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
    country: "Nigeria",
  });

  const itemName = searchParams.get("item") || "Custom Design";
  const collectionName = searchParams.get("collection") || "Merch";
  const itemPrice = parseFloat(searchParams.get("price") || "49.99");
  const itemIcon = searchParams.get("icon") || "👕";
  const itemImage = searchParams.get("image") || undefined;
  const [resolvedItemImage, setResolvedItemImage] = useState<string | undefined>(itemImage);
  const [isFetchingItemImage, setIsFetchingItemImage] = useState(!itemImage);
  const isMerchOrder = ["Merch", "Hate", "Manga"].includes(collectionName);
  const backLink = isMerchOrder ? "/merch-designs" : "/identity-engineering";

  const isHateCapPromo =
    /hate/i.test(collectionName) || /hate\s*cap/i.test(itemName);
  const unitPrice = itemPrice;
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

  useEffect(() => {
    setResolvedItemImage(itemImage);
    setIsFetchingItemImage(!itemImage);
  }, [itemImage]);

  useEffect(() => {
    if (resolvedItemImage || itemImage) {
      setIsFetchingItemImage(false);
      return;
    }

    let isActive = true;
    const collectionSlug = resolveCollectionSlug(collectionName);

    void (async () => {
      setIsFetchingItemImage(true);
      try {
        const response = await apiFetch(`/api/collections/${encodeURIComponent(collectionSlug)}`);

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          collection?: {
            featuredItems?: Array<{ name?: string; image?: string }>;
          };
        };

        const featuredItems = payload.collection?.featuredItems || [];
        const matchingItem =
          featuredItems.find(
            (featuredItem) =>
              featuredItem.name?.trim().toLowerCase() === itemName.trim().toLowerCase(),
          ) || featuredItems[0];

        if (isActive && matchingItem?.image) {
          setResolvedItemImage(matchingItem.image);
        }
      } catch {
        // Keep the emoji fallback if the collection lookup fails.
      } finally {
        if (isActive) {
          setIsFetchingItemImage(false);
        }
      }
    })();

    return () => {
      isActive = false;
    };
  }, [collectionName, itemName, itemImage, resolvedItemImage]);

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
        const response = await apiFetch("/api/delivery/redspeed/cities", {
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
        const response = await apiFetch(`/api/delivery/redspeed/towns/${encodeURIComponent(selectedCityCode)}`, {
          credentials: "include",
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error || "Failed to load RedSpeed towns.");
        }

        const payload = (await response.json()) as { towns?: RedspeedTown[] };
        if (mounted) {
          const townsList = payload.towns || [];
          setRedspeedTowns(townsList);

          // Only auto-match town if using a saved address, otherwise force manual selection
          if (useSavedAddress) {
            const savedPostal = (deliveryDetails.postalCode || "").trim().toLowerCase();
            const savedAddress = (deliveryDetails.address || "").trim().toLowerCase();
            const savedState = (deliveryDetails.state || "").trim().toLowerCase();
            
            let matchedTown = townsList.find(t => {
              const name = (t.name || "").trim().toLowerCase();
              return name && (savedPostal.includes(name) || savedAddress.includes(name) || name.includes(savedPostal) || name.includes(savedState));
            });

            if (matchedTown) {
              setSelectedTownId(Number(matchedTown.id));
              return;
            }
          }

          // Force user to choose town manually for new addresses
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
        const response = await apiFetch("/api/delivery/redspeed/fee", {
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
      
      // Auto-match city code from saved city name
      const savedCityName = (nextSettings.defaultDeliveryDetails.city || "").trim().toLowerCase();
      const matchedCity = redspeedCities.find(
        (c) => (c.name || "").trim().toLowerCase() === savedCityName
      );
      if (matchedCity && matchedCity.abbr) {
        setSelectedCityCode(matchedCity.abbr);
      } else {
        setSelectedCityCode("");
      }
      setSelectedTownId(null);
    }
  }, [walletAddress, redspeedCities]);

  const applySavedAddress = () => {
    setDeliveryDetails(userSettings.defaultDeliveryDetails);
    
    // Auto-match city code
    const savedCityName = (userSettings.defaultDeliveryDetails.city || "").trim().toLowerCase();
    const matchedCity = redspeedCities.find(
      (c) => (c.name || "").trim().toLowerCase() === savedCityName
    );
    if (matchedCity && matchedCity.abbr) {
      setSelectedCityCode(matchedCity.abbr);
    } else {
      setSelectedCityCode("");
    }
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
      country: "Nigeria",
    });
    setSelectedCityCode("");
    setSelectedTownId(null);
  };

  const buildPaymentMetadata = () => ({
    orderId: undefined as string | undefined,
    walletAddress: walletAddress ?? "",
    itemName,
    collectionName,
    image: (resolvedItemImage?.startsWith("data:image") ? "custom-design-base64" : resolvedItemImage) ?? itemIcon,
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

    let shouldResetSubmitting = true;

    try {
      setIsSubmitting(true);

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

      const orderId = `ltc-${crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;
      const metadata = {
        ...buildPaymentMetadata(),
        orderId,
        walletAddress: walletAddress ?? "",
      };
      const response = await apiFetch("/api/payments/dogemeatpay/session", {
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
            image: (resolvedItemImage?.startsWith("data:image") ? "custom-design-base64" : resolvedItemImage) ?? itemIcon,
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
        const payload = (await response.json().catch(() => ({}))) as Record<string, unknown> | string;
        let errMsg: string;
        if (payload && typeof payload === "object" && "error" in payload && typeof (payload as any).error === "string") {
          errMsg = (payload as any).error as string;
        } else if (typeof payload === "string") {
          errMsg = payload;
        } else if (payload && typeof payload === "object") {
          try {
            errMsg = JSON.stringify(payload as Record<string, unknown>);
          } catch {
            errMsg = response.statusText || "Failed to create Dogemeat Pay session.";
          }
        } else {
          errMsg = response.statusText || "Failed to create Dogemeat Pay session.";
        }

        throw new Error(errMsg || "Failed to create Dogemeat Pay session.");
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
      <div className="min-h-screen bg-white text-black">
        <Header />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-40 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-green-50 text-green-600 rounded-full mb-12"
          >
            <Check className="w-12 h-12" />
          </motion.div>
          <h1 className="font-serif text-5xl sm:text-6xl uppercase tracking-tighter text-black mb-8">
            Order <span className="italic">Confirmed</span>
          </h1>
          <p className="text-gray-400 font-serif italic text-xl mb-12 max-w-md mx-auto leading-relaxed">
            "Your custom order has been placed! A confirmation email has been sent to your address."
          </p>
          {(isSyncingPayment || paymentSyncError) && (
            <div className="mb-12 p-6 bg-gray-50 border border-gray-100 rounded-sm text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black mb-2">
                {isSyncingPayment ? "Syncing System..." : "System Sync Alert"}
              </p>
              {paymentSyncError && <p className="text-sm text-red-600 font-serif italic">{paymentSyncError}</p>}
            </div>
          )}
          <Link
            to="/dashboard"
            className="inline-flex items-center px-12 py-4 bg-black text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-red-600 transition-all duration-500 shadow-xl"
          >
            Go to Dashboard
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header Section */}
        <div className="flex flex-col items-start mb-24 pt-20">
          <Link
            to={backLink}
            className="inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] text-gray-300 hover:text-black transition-colors group mb-12"
          >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-2 transition-transform" />
            <span>Return to {collectionName}</span>
          </Link>
          
          <div className="inline-flex items-center gap-4 mb-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-red-600">Step 02 / 02</span>
            <div className="w-12 h-[1px] bg-red-600/30" />
          </div>

          <h1 className="font-serif text-4xl sm:text-8xl uppercase tracking-tighter text-black leading-none mb-8">
            The <br />
            <span className="italic">Checkout</span>
          </h1>
          <p className="font-serif text-2xl italic text-gray-400 max-w-xl leading-relaxed">
            "Your custom order is almost ready. Complete your delivery details below to finish your order."
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-start">
          {/* Item Preview and Details */}
          <div className="lg:col-span-5 space-y-16">
            <div className="relative aspect-[3/4] bg-gray-50 border border-gray-100 p-1 rounded-sm overflow-hidden group">
              <div className="w-full h-full bg-white flex items-center justify-center relative overflow-hidden">
                {isFetchingItemImage ? (
                  <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : resolvedItemImage ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5 }}
                    src={resolvedItemImage}
                    alt={itemName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-9xl opacity-10 grayscale">{itemIcon}</span>
                )}
                
                {/* Overlay details */}
                <div className="absolute inset-0 border-[20px] border-white z-20 pointer-events-none" />
                <div className="absolute top-10 left-10 text-[9px] font-bold uppercase tracking-widest text-black/10 z-20">Order Code: {itemName.slice(0, 3).toUpperCase()}</div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex justify-between items-end border-b border-gray-100 pb-10">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 block mb-2">{collectionName} Series</span>
                  <h2 className="font-serif text-4xl italic text-black capitalize">{itemName}</h2>
                </div>
                <div className="text-right">
                  <span className="font-serif text-3xl sm:text-5xl text-black tracking-tighter">${unitPrice.toFixed(0)}</span>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-300">Price Per Item</span>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-black">Configuration</h3>
                
                <div className="space-y-6">
                  {isHateCapPromo ? (
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Cap Base Color</label>
                        <input
                          type="text"
                          placeholder="e.g., Deep Charcoal"
                          value={capColor}
                          onChange={(e) => setCapColor(e.target.value)}
                          className="w-full px-0 py-4 bg-transparent border-b border-gray-300 font-slab text-xl text-black placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Identity Accent Color</label>
                        <input
                          type="text"
                          placeholder="e.g., Crimson Red"
                          value={hateColor}
                          onChange={(e) => setHateColor(e.target.value)}
                          className="w-full px-0 py-4 bg-transparent border-b border-gray-300 font-slab text-xl text-black placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Selected Colorway</label>
                      <input
                        type="text"
                        placeholder="e.g., Pure White"
                        value={capColor}
                        onChange={(e) => setCapColor(e.target.value)}
                        className="w-full px-0 py-4 bg-transparent border-b border-gray-300 font-slab text-xl text-black placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-7">
            {!isConnected ? (
              <div className="bg-gray-50/50 border border-gray-100 rounded-sm p-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white text-black mb-8 shadow-sm">
                  <Wallet className="w-5 h-5 font-light" />
                </div>
                <h3 className="font-serif text-3xl italic text-black mb-4">Connect Your Wallet</h3>
                <p className="text-gray-400 font-serif italic mb-12 max-w-sm mx-auto leading-relaxed">
                  "Please connect your wallet to proceed with your order and delivery options."
                </p>
                <div className="flex justify-center">
                  <ConnectWallet />
                </div>
              </div>
            ) : (
              <div className="space-y-16">
                <div className="space-y-12">
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-bold text-gray-300 tracking-[0.3em]">01</span>
                    <h2 className="font-serif text-2xl text-black italic">Delivery Destination</h2>
                    <div className="flex-1 h-[1px] bg-gray-100" />
                  </div>

                  <div className="flex flex-wrap gap-4 mb-10">
                    <button
                      type="button"
                      onClick={() => {
                        setUseSavedAddress(true);
                        applySavedAddress();
                      }}
                      className={`px-8 py-3 border text-[10px] font-bold uppercase tracking-[0.3em] rounded-sm transition-all duration-500 ${
                        useSavedAddress ? "bg-black text-white border-black" : "border-gray-100 text-gray-300 hover:text-black hover:border-black"
                      }`}
                    >
                      Saved Address
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUseSavedAddress(false);
                        clearAddressForm();
                      }}
                      className={`px-8 py-3 border text-[10px] font-bold uppercase tracking-[0.3em] rounded-sm transition-all duration-500 ${
                        !useSavedAddress ? "bg-black text-white border-black" : "border-gray-100 text-gray-300 hover:text-black hover:border-black"
                      }`}
                    >
                      New Address
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
                    {[
                      { id: "fullName", label: "Full Name", placeholder: "e.g., Alexander McQueen", type: "text" },
                      { id: "email", label: "Email Address", placeholder: "e.g., contact@studio.com", type: "email" },
                      { id: "phone", label: "Phone Number", placeholder: "e.g., +234 812 345 6789", type: "tel" },
                      { id: "address", label: "Street Address", placeholder: "e.g., 12 Heritage Way", type: "text" },
                    ].map((field) => (
                      <div key={field.id} className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-600">{field.label}</label>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={deliveryDetails[field.id as keyof DeliveryDetails]}
                          onChange={(e) => updateDeliveryField(field.id as keyof DeliveryDetails, e.target.value)}
                          className="w-full px-0 py-4 bg-transparent border-b border-gray-300 font-slab text-xl text-black placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                        />
                      </div>
                    ))}
                    
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-600">State / Region</label>
                      <input
                        type="text"
                        placeholder="e.g., Lagos"
                        value={deliveryDetails.state}
                        onChange={(e) => updateDeliveryField("state", e.target.value)}
                        className="w-full px-0 py-4 bg-transparent border-b border-gray-300 font-slab text-xl text-black placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Postal / ZIP Code</label>
                      <input
                        type="text"
                        placeholder="e.g., 100001"
                        value={deliveryDetails.postalCode}
                        onChange={(e) => updateDeliveryField("postalCode", e.target.value)}
                        className="w-full px-0 py-4 bg-transparent border-b border-gray-300 font-slab text-xl text-black placeholder:text-gray-400 focus:border-black focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* RedSpeed Location Logic */}
                  <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 pt-10">
                    <div className="space-y-3 relative">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Delivery City</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCityOpen(!isCityOpen);
                            setIsTownOpen(false);
                          }}
                          className="w-full px-0 py-4 bg-transparent border-b border-gray-300 font-slab text-xl text-left text-black focus:border-black focus:outline-none flex justify-between items-center transition-colors"
                        >
                          <span className={selectedCityCode ? "text-black" : "text-gray-400 not-italic"}>
                            {selectedCityCode 
                              ? (redspeedCities.find(c => c.abbr === selectedCityCode)?.name || "Select City")
                              : "Select City"}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isCityOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isCityOpen && (
                          <>
                            {/* Backdrop to close dropdown on click outside */}
                            <div className="fixed inset-0 z-40" onClick={() => setIsCityOpen(false)} />
                            
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 shadow-2xl rounded-sm z-50 overflow-hidden"
                            >
                              {/* Search bar inside dropdown */}
                              <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                                <input
                                  type="text"
                                  placeholder="Search city..."
                                  value={citySearch}
                                  onChange={(e) => setCitySearch(e.target.value)}
                                  className="w-full bg-transparent text-xs font-slab py-1 px-2 border-b border-transparent focus:border-black focus:outline-none text-black placeholder:text-gray-400"
                                  onClick={(e) => e.stopPropagation()} // Prevent closing dropdown when clicking input
                                />
                              </div>

                              <div className="max-h-60 overflow-y-auto py-2">
                                {redspeedCities
                                  .filter(c => c.abbr || c.name)
                                  .filter(c => (c.name || "").toLowerCase().includes(citySearch.toLowerCase()))
                                  .map((city) => (
                                    <button
                                      key={city.abbr}
                                      type="button"
                                      onClick={() => {
                                        setSelectedCityCode(city.abbr || "");
                                        updateDeliveryField("city", city.name || "");
                                        setSelectedTownId(null); // Reset town
                                        setIsCityOpen(false);
                                        setCitySearch(""); // Clear search
                                      }}
                                      className={`w-full px-6 py-3 text-left font-serif text-base italic transition-colors hover:bg-red-50 hover:text-red-600 flex justify-between items-center ${
                                        selectedCityCode === city.abbr ? "bg-gray-50 text-red-600 font-bold" : "text-black"
                                      }`}
                                    >
                                      <span>{city.name}</span>
                                      {selectedCityCode === city.abbr && <Check className="w-3.5 h-3.5 text-red-600" />}
                                    </button>
                                  ))}
                                {redspeedCities.filter(c => c.abbr || c.name).filter(c => (c.name || "").toLowerCase().includes(citySearch.toLowerCase())).length === 0 && (
                                  <div className="px-6 py-4 text-xs font-serif italic text-gray-400 text-center">
                                    No cities found
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 relative">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Delivery Town / Area</label>
                      <div className="relative">
                        <button
                          type="button"
                          disabled={!selectedCityCode || isLoadingTowns}
                          onClick={() => {
                            setIsTownOpen(!isTownOpen);
                            setIsCityOpen(false);
                          }}
                          className="w-full px-0 py-4 bg-transparent border-b border-gray-300 font-slab text-xl text-left text-black focus:border-black focus:outline-none flex justify-between items-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <span className={selectedTownId ? "text-black" : "text-gray-400 not-italic"}>
                            {isLoadingTowns 
                              ? "Loading Towns..." 
                              : selectedTownId 
                                ? (redspeedTowns.find(t => t.id === selectedTownId)?.name || "Select Town")
                                : "Select Town"}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isTownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isTownOpen && !isLoadingTowns && selectedCityCode && (
                          <>
                            {/* Backdrop to close dropdown on click outside */}
                            <div className="fixed inset-0 z-40" onClick={() => setIsTownOpen(false)} />
                            
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 shadow-2xl rounded-sm z-50 overflow-hidden"
                            >
                              {/* Search bar inside dropdown */}
                              <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                                <input
                                  type="text"
                                  placeholder="Search town/area..."
                                  value={townSearch}
                                  onChange={(e) => setTownSearch(e.target.value)}
                                  className="w-full bg-transparent text-xs font-slab py-1 px-2 border-b border-transparent focus:border-black focus:outline-none text-black placeholder:text-gray-400"
                                  onClick={(e) => e.stopPropagation()} // Prevent closing dropdown when clicking input
                                />
                              </div>

                              <div className="max-h-60 overflow-y-auto py-2">
                                {redspeedTowns
                                  .filter(t => (t.name || "").toLowerCase().includes(townSearch.toLowerCase()))
                                  .map((town) => (
                                    <button
                                      key={town.id}
                                      type="button"
                                      onClick={() => {
                                        setSelectedTownId(Number(town.id));
                                        setIsTownOpen(false);
                                        setTownSearch(""); // Clear search
                                      }}
                                      className={`w-full px-6 py-3 text-left font-serif text-base italic transition-colors hover:bg-red-50 hover:text-red-600 flex justify-between items-center ${
                                        selectedTownId === town.id ? "bg-gray-50 text-red-600 font-bold" : "text-black"
                                      }`}
                                    >
                                      <span>{town.name}</span>
                                      {selectedTownId === town.id && <Check className="w-3.5 h-3.5 text-red-600" />}
                                    </button>
                                  ))}
                                {redspeedTowns.filter(t => (t.name || "").toLowerCase().includes(townSearch.toLowerCase())).length === 0 && (
                                  <div className="px-6 py-4 text-xs font-serif italic text-gray-400 text-center">
                                    No towns found
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Totals and Payment */}
                <div className="space-y-12">
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-bold text-gray-300 tracking-[0.3em]">02</span>
                    <h2 className="font-serif text-2xl text-black italic">Payment Details</h2>
                    <div className="flex-1 h-[1px] bg-gray-100" />
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      <span>Subtotal</span>
                      <span className="text-black font-serif text-xl italic">${subtotal.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      <span>Shipping Fee</span>
                      <span className={shipping > 0 || isCalculatingDeliveryFee ? "text-black font-serif text-xl italic" : "text-gray-400 font-serif text-sm italic"}>
                        {isCalculatingDeliveryFee ? "Calculating..." : shipping > 0 ? `$${shipping.toFixed(0)}` : "Select City & Town"}
                      </span>
                    </div>
                    <div className="pt-6 border-t border-black flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 block mb-2">Total Price</span>
                        <h3 className="font-serif text-4xl sm:text-5xl text-black tracking-tighter">${total.toFixed(0)}</h3>
                      </div>
                      
                      <button
                        onClick={() => handlePaymentLinkCheckout()}
                        disabled={isSubmitting || !isColorSelectionComplete || !isDeliveryDetailsComplete || !isDeliveryFeeReady}
                        className={`w-full sm:w-auto px-16 py-6 font-bold text-[11px] uppercase tracking-[0.5em] transition-all duration-700 shadow-2xl relative overflow-hidden group ${
                          isSubmitting || !isColorSelectionComplete || !isDeliveryDetailsComplete || !isDeliveryFeeReady
                            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                            : "bg-black text-white hover:bg-red-600"
                        }`}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-4">
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Buy Now
                              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  </div>

                  {locationError && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 text-center">
                      Error: {locationError}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Confirmation Modal */}
      {showCheckoutConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-100 rounded-sm p-12 max-w-lg w-full text-center shadow-2xl"
          >
            <h3 className="font-serif text-4xl italic text-black mb-6">Confirm Order</h3>
            <p className="text-gray-400 font-serif italic mb-10 leading-relaxed">
              "By proceeding, you confirm that your custom design options and shipping address are correct."
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handlePaymentLinkCheckout(true)}
                className="w-full py-5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-red-600 transition-all duration-500 shadow-xl"
              >
                Confirm and Pay
              </button>
              <button
                onClick={() => setShowCheckoutConfirmation(false)}
                className="w-full py-4 text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 hover:text-black transition-colors"
              >
                Go Back
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

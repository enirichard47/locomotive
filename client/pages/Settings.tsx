import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  RefreshCw,
  Save,
  Shield,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWallet } from "@/contexts/WalletContext";
import { Switch } from "@/components/ui/switch";
import ConnectWallet from "@/components/ConnectWallet";
import { apiFetch } from "@/lib/storefront";
import {
  getDefaultSettings,
  getUserSettings,
  saveUserSettings,
  type UserSettings,
} from "@/lib/user";

type RedspeedCity = {
  id?: number;
  abbr?: string;
  name?: string;
};

type BooleanSettingKey = {
  [K in keyof UserSettings]: UserSettings[K] extends boolean ? K : never;
}[keyof UserSettings];

const shortenAddress = (address: string) =>
  address.length > 12 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;

export default function Settings() {
  const { walletAddress, disconnect, isConnected } = useWallet();
  const address = walletAddress ?? "";
  const [settings, setSettings] = useState<UserSettings>(getDefaultSettings());
  const [isDirty, setIsDirty] = useState(false);
  const [redspeedCities, setRedspeedCities] = useState<RedspeedCity[]>([]);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  // Load user settings on mount or wallet address change
  useEffect(() => {
    if (!address) {
      setSettings(getDefaultSettings());
      setIsDirty(false);
      return;
    }

    setSettings(getUserSettings(address));
    setIsDirty(false);
  }, [address]);

  // Load cities from API
  useEffect(() => {
    let mounted = true;
    const loadCities = async () => {
      try {
        const response = await apiFetch("/api/delivery/redspeed/cities");
        if (response.ok) {
          const payload = (await response.json()) as { cities?: RedspeedCity[] };
          if (mounted) {
            setRedspeedCities(payload.cities || []);
          }
        }
      } catch {
        // Ignore errors
      }
    };
    loadCities();
    return () => {
      mounted = false;
    };
  }, []);

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
    setIsDirty(true);
  };

  const updateAddressField = (field: keyof UserSettings["defaultDeliveryDetails"], value: string) => {
    setSettings((current) => ({
      ...current,
      defaultDeliveryDetails: {
        ...current.defaultDeliveryDetails,
        [field]: value,
      },
    }));
    setIsDirty(true);
  };

  const handleToggle = (key: BooleanSettingKey) => {
    updateSetting(key, !settings[key] as UserSettings[typeof key]);
  };

  const handleSave = () => {
    if (!address) {
      toast.error("Connect your wallet before saving settings.");
      return;
    }

    saveUserSettings(address, settings);
    setIsDirty(false);
    toast.success("Settings saved successfully.");
  };

  const handleReset = () => {
    if (address) {
      setSettings(getUserSettings(address));
      setIsDirty(false);
      toast.success("Reverted to saved wallet settings.");
      return;
    }

    setSettings(getDefaultSettings());
    setIsDirty(false);
    toast.success("Reverted to defaults.");
  };

  const handleDisconnectWallet = () => {
    disconnect();
    toast.success("Wallet disconnected.");
  };

  const handleCopyWallet = async () => {
    if (!address) {
      toast.error("No wallet connected.");
      return;
    }

    try {
      await navigator.clipboard.writeText(address);
      toast.success("Wallet address copied.");
    } catch {
      toast.error("Could not copy wallet address.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        {/* Back Link */}
        <div className="mb-12">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-gray-500 hover:text-black transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
        </div>

        {/* Section Header */}
        <div className="border-b border-gray-200 pb-12 mb-20">
          <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-red-600 mb-4 block">Preferences</span>
          <h1 className="font-serif text-5xl sm:text-7xl uppercase tracking-tighter mb-4 leading-none">
            Your <span className="italic font-light text-red-600 pr-2">Profile</span> & <br />Settings
          </h1>
          <p className="text-gray-500 font-serif italic text-lg max-w-md">
            Configure your notification preferences, default shipping details, and regional currency settings.
          </p>
        </div>

        {!isConnected ? (
          /* Breathtaking Connect Wallet Prompt */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-sm p-16 sm:p-24 text-center max-w-xl mx-auto my-20 shadow-2xl bg-white"
          >
            <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-8 animate-pulse-slow" />
            <h2 className="font-serif text-3xl text-black mb-4">Connect Your Wallet</h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-12 leading-relaxed">
              Your preferences and defaults are securely stored and tied to your digital signature. Connect your wallet to begin configuring your profile.
            </p>
            <div className="inline-block scale-110">
              <ConnectWallet />
            </div>
          </motion.div>
        ) : (
          /* Redesigned Settings Forms */
          <div className="space-y-24">
            {/* Account Profile Section */}
            <section className="space-y-10">
              <div className="border-b border-gray-100 pb-6 flex items-baseline justify-between">
                <h2 className="font-serif text-3xl text-black italic">Account Info</h2>
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400">Section 01</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Display Name</label>
                  <input
                    type="text"
                    value={settings.displayName}
                    onChange={(e) => updateSetting("displayName", e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-transparent border-b border-gray-300 font-slab text-xl text-black focus:border-black focus:outline-none py-3 transition-colors placeholder:text-gray-300"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Contact Email</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => updateSetting("contactEmail", e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent border-b border-gray-300 font-slab text-xl text-black focus:border-black focus:outline-none py-3 transition-colors placeholder:text-gray-300"
                  />
                </div>
              </div>
            </section>

            {/* Notification Preferences */}
            <section className="space-y-10">
              <div className="border-b border-gray-100 pb-6 flex items-baseline justify-between">
                <h2 className="font-serif text-3xl text-black italic">Communication Preferences</h2>
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400">Section 02</span>
              </div>

              <div className="space-y-6">
                {[
                  { key: "orderAlerts", title: "Order updates", desc: "Get live notifications on your custom order design updates and receipt statuses." },
                  { key: "deliveryAlerts", title: "Delivery updates", desc: "Receive immediate alerts when your items are shipped and delivered." },
                  { key: "emailUpdates", title: "Email confirmations", desc: "Get copies of order invoices, shipping IDs, and receipts in your email." },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-8 py-6 border-b border-gray-100 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-serif text-xl italic text-black mb-1">{item.title}</p>
                      <p className="text-sm text-gray-500 font-light leading-relaxed max-w-xl">{item.desc}</p>
                    </div>
                    <Switch
                      checked={Boolean(settings[item.key as BooleanSettingKey])}
                      onCheckedChange={() => handleToggle(item.key as BooleanSettingKey)}
                      className="data-[state=checked]:bg-red-600"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Default Shipping Address */}
            <section className="space-y-10">
              <div className="border-b border-gray-100 pb-6 flex items-baseline justify-between">
                <h2 className="font-serif text-3xl text-black italic">Default Shipping Profile</h2>
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400">Section 03</span>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between gap-8 py-6 border-b border-gray-100 mb-8">
                  <div>
                    <p className="font-serif text-xl italic text-black mb-1">Auto-fill Address at Checkout</p>
                    <p className="text-sm text-gray-500 font-light max-w-xl">Automatically fill in these shipping coordinates when you proceed to checkout.</p>
                  </div>
                  <Switch
                    checked={settings.useSavedAddressByDefault}
                    onCheckedChange={() => handleToggle("useSavedAddressByDefault")}
                    className="data-[state=checked]:bg-red-600"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Full Name</label>
                    <input
                      type="text"
                      placeholder="Receiver's Name"
                      value={settings.defaultDeliveryDetails.fullName}
                      onChange={(e) => updateAddressField("fullName", e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 font-slab text-xl text-black focus:border-black focus:outline-none py-3 transition-colors placeholder:text-gray-300"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Contact Email</label>
                    <input
                      type="email"
                      placeholder="receiver@example.com"
                      value={settings.defaultDeliveryDetails.email}
                      onChange={(e) => updateAddressField("email", e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 font-slab text-xl text-black focus:border-black focus:outline-none py-3 transition-colors placeholder:text-gray-300"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +234..."
                      value={settings.defaultDeliveryDetails.phone}
                      onChange={(e) => updateAddressField("phone", e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 font-slab text-xl text-black focus:border-black focus:outline-none py-3 transition-colors placeholder:text-gray-300"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Street Address</label>
                    <input
                      type="text"
                      placeholder="128 Luxury Drive"
                      value={settings.defaultDeliveryDetails.address}
                      onChange={(e) => updateAddressField("address", e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 font-slab text-xl text-black focus:border-black focus:outline-none py-3 transition-colors placeholder:text-gray-300"
                    />
                  </div>

                  {/* City Dropdown Selection */}
                  <div className="space-y-3 relative">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Delivery City</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsCityOpen(!isCityOpen)}
                        className="w-full px-0 py-3.5 bg-transparent border-b border-gray-300 font-slab text-xl text-left text-black focus:border-black focus:outline-none flex justify-between items-center transition-colors"
                      >
                        <span className={settings.defaultDeliveryDetails.city ? "text-black" : "text-gray-400 not-italic"}>
                          {settings.defaultDeliveryDetails.city || "Select City"}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isCityOpen ? "rotate-180" : ""}`} />
                      </button>

                      {isCityOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsCityOpen(false)} />
                          
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 shadow-2xl rounded-sm z-50 overflow-hidden"
                          >
                            <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                              <input
                                type="text"
                                placeholder="Search city..."
                                value={citySearch}
                                onChange={(e) => setCitySearch(e.target.value)}
                                className="w-full bg-transparent text-xs font-slab py-1 px-2 border-b border-transparent focus:border-black focus:outline-none text-black placeholder:text-gray-400"
                                onClick={(e) => e.stopPropagation()}
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
                                      updateAddressField("city", city.name || "");
                                      setIsCityOpen(false);
                                      setCitySearch("");
                                    }}
                                    className={`w-full px-6 py-3 text-left font-serif text-base italic transition-colors hover:bg-red-50 hover:text-red-600 flex justify-between items-center ${
                                      settings.defaultDeliveryDetails.city === city.name ? "bg-gray-50 text-red-600 font-bold" : "text-black"
                                    }`}
                                  >
                                    <span>{city.name}</span>
                                    {settings.defaultDeliveryDetails.city === city.name && <Check className="w-3.5 h-3.5 text-red-600" />}
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

                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">State / Region</label>
                    <input
                      type="text"
                      placeholder="e.g. Lagos, Federal Capital..."
                      value={settings.defaultDeliveryDetails.state}
                      onChange={(e) => updateAddressField("state", e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 font-slab text-xl text-black focus:border-black focus:outline-none py-3 transition-colors placeholder:text-gray-300"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Postal / ZIP Code</label>
                    <input
                      type="text"
                      placeholder="100001"
                      value={settings.defaultDeliveryDetails.postalCode}
                      onChange={(e) => updateAddressField("postalCode", e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 font-slab text-xl text-black focus:border-black focus:outline-none py-3 transition-colors placeholder:text-gray-300"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Country</label>
                    <input
                      type="text"
                      placeholder="Nigeria"
                      value={settings.defaultDeliveryDetails.country}
                      onChange={(e) => updateAddressField("country", e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 font-slab text-xl text-black focus:border-black focus:outline-none py-3 transition-colors placeholder:text-gray-300"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Privacy Settings */}
            <section className="space-y-10">
              <div className="border-b border-gray-100 pb-6 flex items-baseline justify-between">
                <h2 className="font-serif text-3xl text-black italic">Security & Double Check</h2>
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400">Section 04</span>
              </div>

              <div className="flex items-center justify-between gap-8 py-6 border-b border-gray-100">
                <div>
                  <p className="font-serif text-xl italic text-black mb-1">Checkout Review Overlay</p>
                  <p className="text-sm text-gray-500 font-light max-w-xl">Enforce a checkout verification step to double check item sizes and options before sending order.</p>
                </div>
                <Switch
                  checked={settings.requireCheckoutConfirmation}
                  onCheckedChange={() => handleToggle("requireCheckoutConfirmation")}
                  className="data-[state=checked]:bg-red-600"
                />
              </div>
            </section>

            {/* Regional Preferences */}
            <section className="space-y-10">
              <div className="border-b border-gray-100 pb-6 flex items-baseline justify-between">
                <h2 className="font-serif text-3xl text-black italic">Regional Details</h2>
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400">Section 05</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-3 relative">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Preferred Currency</label>
                  <div className="relative">
                    <select
                      value={settings.currency}
                      onChange={(e) => updateSetting("currency", e.target.value as UserSettings["currency"])}
                      className="w-full bg-transparent border-b border-gray-300 font-slab text-xl text-black focus:border-black focus:outline-none py-3.5 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="NGN">NGN - Nigerian Naira</option>
                    </select>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 relative">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-600">Timezone</label>
                  <div className="relative">
                    <select
                      value={settings.timezone}
                      onChange={(e) => updateSetting("timezone", e.target.value)}
                      className="w-full bg-transparent border-b border-gray-300 font-slab text-xl text-black focus:border-black focus:outline-none py-3.5 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                      <option value="UTC">UTC (GMT)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="America/New_York">America/New York (EST)</option>
                    </select>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Wallet Session Card */}
            <section className="border border-gray-200 rounded-sm p-10 bg-gray-50 space-y-6">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-black" />
                <h2 className="font-serif text-xl text-black italic">Active Wallet Session</h2>
              </div>
              
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Connected Public Address</p>
                <p className="font-mono text-sm break-all font-medium text-black">{address}</p>
                <p className="text-xs text-gray-500 font-serif italic">Currently active session for profile edits.</p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCopyWallet}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 font-bold uppercase tracking-widest text-[9px] hover:border-black transition-colors bg-white text-black"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Wallet
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 font-bold uppercase tracking-widest text-[9px] hover:border-black transition-colors bg-white text-black"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Revert Changes
                </button>
                <button
                  type="button"
                  onClick={handleDisconnectWallet}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-red-200 hover:border-red-600 text-red-600 font-bold uppercase tracking-widest text-[9px] hover:bg-red-50 transition-colors bg-white"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Disconnect Wallet
                </button>
              </div>
            </section>

            {/* Save Button */}
            <div className="flex items-center justify-center pt-8">
              <button
                type="button"
                onClick={handleSave}
                disabled={!isDirty}
                className="inline-flex items-center justify-center px-16 py-5 bg-black text-white hover:bg-red-600 font-bold uppercase tracking-[0.5em] text-[11px] transition-all duration-700 rounded-sm shadow-xl disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed group"
              >
                <Save className="w-3.5 h-3.5 mr-2 group-hover:rotate-12 transition-transform" />
                {isDirty ? "Save Settings" : "Saved"}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

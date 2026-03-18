import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Copy,
  Globe,
  MapPin,
  RefreshCw,
  Save,
  Shield,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWallet } from "@/contexts/WalletContext";
import { Switch } from "@/components/ui/switch";
import {
  getDefaultSettings,
  getUserSettings,
  saveUserSettings,
  type UserSettings,
} from "@/lib/user";

type BooleanSettingKey = {
  [K in keyof UserSettings]: UserSettings[K] extends boolean ? K : never;
}[keyof UserSettings];

const shortenAddress = (address: string) =>
  address.length > 12 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;

const hasAnyDeliveryField = (settings: UserSettings) =>
  Object.values(settings.defaultDeliveryDetails).some((value) => value.trim().length > 0);

export default function Settings() {
  const { walletAddress, disconnect, isConnected } = useWallet();
  const address = walletAddress ?? "";
  const [settings, setSettings] = useState<UserSettings>(getDefaultSettings());
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!address) {
      setSettings(getDefaultSettings());
      setIsDirty(false);
      return;
    }

    setSettings(getUserSettings(address));
    setIsDirty(false);
  }, [address]);

  const walletSummary = useMemo(() => {
    if (!address) {
      return "No wallet connected";
    }

    return `${shortenAddress(address)} connected`;
  }, [address]);

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
    toast.success("Settings saved.");
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
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--background))] to-[hsl(var(--card))]/30">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="relative overflow-hidden rounded-3xl border-2 border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--primary))]/10 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--primary))]/10 rounded-full blur-3xl"></div>

          <div className="relative">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--primary))] to-green-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[hsl(var(--foreground))] to-[hsl(var(--primary))] bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-[hsl(var(--muted-foreground))] text-lg mt-1">
                  Basic wallet and delivery preferences
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-b-2 border-[hsl(var(--border))] p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Account</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Personal details used during checkout and receipts</p>
              </div>
            </div>
          </div>

          <div className="p-6 grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Display Name</label>
              <input
                value={settings.displayName}
                onChange={(e) => updateSetting("displayName", e.target.value)}
                placeholder="Optional name"
                className="w-full rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Contact Email</label>
              <input
                value={settings.contactEmail}
                onChange={(e) => updateSetting("contactEmail", e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b-2 border-[hsl(var(--border))] p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Notifications</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Control what updates you receive</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-3">
            {[
              ["orderAlerts", "Order updates", "Get updates on payment and processing stages."],
              ["deliveryAlerts", "Delivery updates", "Get updates once delivery starts moving."],
              ["emailUpdates", "Email receipts", "Receive receipts and confirmations by email."],
            ].map(([key, title, description]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4 p-5 rounded-xl border border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--background))]/50 to-[hsl(var(--background))]"
              >
                <div className="flex-1">
                  <p className="font-semibold text-lg mb-1">{title}</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
                </div>
                <Switch
                  checked={Boolean(settings[key as BooleanSettingKey])}
                  onCheckedChange={() => handleToggle(key as BooleanSettingKey)}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-b-2 border-[hsl(var(--border))] p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Delivery Defaults</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Saved address can prefill checkout, but you can still edit anytime</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-4 p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
              <div>
                <p className="font-semibold">Use saved address by default</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Auto-fill delivery details at checkout.</p>
              </div>
              <Switch
                checked={settings.useSavedAddressByDefault}
                onCheckedChange={() => handleToggle("useSavedAddressByDefault")}
              />
            </div>

            {!hasAnyDeliveryField(settings) && (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">No default address saved yet.</p>
            )}

            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                placeholder="Full Name"
                value={settings.defaultDeliveryDetails.fullName}
                onChange={(e) => updateAddressField("fullName", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))]"
              />
              <input
                type="email"
                placeholder="Email"
                value={settings.defaultDeliveryDetails.email}
                onChange={(e) => updateAddressField("email", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))]"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={settings.defaultDeliveryDetails.phone}
                onChange={(e) => updateAddressField("phone", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))]"
              />
              <input
                type="text"
                placeholder="Street Address"
                value={settings.defaultDeliveryDetails.address}
                onChange={(e) => updateAddressField("address", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))]"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={settings.defaultDeliveryDetails.city}
                  onChange={(e) => updateAddressField("city", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))]"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={settings.defaultDeliveryDetails.state}
                  onChange={(e) => updateAddressField("state", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={settings.defaultDeliveryDetails.postalCode}
                  onChange={(e) => updateAddressField("postalCode", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))]"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={settings.defaultDeliveryDetails.country}
                  onChange={(e) => updateAddressField("country", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b-2 border-[hsl(var(--border))] p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Privacy & Security</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Simple controls for visibility and order confirmation</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between gap-4 p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]">
              <div>
                <p className="font-semibold">Require confirmation before checkout</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Add a final review prompt before payment redirect.</p>
              </div>
              <Switch
                checked={settings.requireCheckoutConfirmation}
                onCheckedChange={() => handleToggle("requireCheckoutConfirmation")}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b-2 border-[hsl(var(--border))] p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Regional Preferences</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Set locale values used in UI and receipts</p>
              </div>
            </div>
          </div>

          <div className="p-6 grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => updateSetting("currency", e.target.value as UserSettings["currency"])}
                className="w-full rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="NGN">NGN - Nigerian Naira</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => updateSetting("timezone", e.target.value)}
                className="w-full rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3"
              >
                <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                <option value="UTC">UTC (GMT)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="America/New_York">America/New York (EST)</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border-2 border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] to-orange-500/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Wallet Session</h2>
          </div>
          <div className="p-4 rounded-xl bg-[hsl(var(--background))] border border-[hsl(var(--border))]">
            <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">Connected Wallet</p>
            <p className="font-mono text-sm md:text-base font-medium break-all">{address || "Not connected"}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">{walletSummary}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleCopyWallet}
              disabled={!address}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] disabled:opacity-50"
            >
              <Copy className="w-4 h-4" />
              Copy Wallet
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/60 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleDisconnectWallet}
              disabled={!isConnected}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Shield className="w-4 h-4" />
              Disconnect Wallet
            </button>
          </div>
        </section>

        <div className="flex items-center justify-center pt-4">
          <button
            onClick={handleSave}
            disabled={!address || !isDirty}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))] to-green-500 text-white text-lg font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            {isDirty ? "Save Settings" : "Settings Saved"}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

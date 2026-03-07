import { useState } from "react";
import { Bell, Globe, Save, Shield, Wallet, ArrowLeft, Sparkles } from "lucide-react";
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

export default function Settings() {
  const { walletAddress } = useWallet();
  const address = walletAddress ?? "";
  const [settings, setSettings] = useState<UserSettings>(
    address ? getUserSettings(address) : getDefaultSettings(),
  );

  const handleToggle = (key: keyof UserSettings) => {
    if (typeof settings[key] !== "boolean") {
      return;
    }

    setSettings((current) => ({
      ...current,
      [key]: !current[key as keyof UserSettings],
    }));
  };

  const handleSave = () => {
    if (!address) {
      toast.error("Connect your wallet before saving settings.");
      return;
    }

    saveUserSettings(address, settings);
    toast.success("Settings saved.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--background))] to-[hsl(var(--card))]/30">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] via-[hsl(var(--card))] to-[hsl(var(--primary))]/10 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--primary))]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--primary))] to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[hsl(var(--foreground))] to-[hsl(var(--primary))] bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-[hsl(var(--muted-foreground))] text-lg mt-1">
                  Customize your experience
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <section className="rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b-2 border-[hsl(var(--border))] p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Notifications</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Manage your alert preferences</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-3">
            {[
              ["emailUpdates", "Email updates", "Get updates on product launches and releases."],
              ["orderAlerts", "Order alerts", "Receive processing, shipped, and delivered alerts."],
              ["marketingMessages", "Marketing messages", "Receive campaign and promo announcements."],
            ].map(([key, title, description]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4 p-5 rounded-xl border border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--background))]/50 to-[hsl(var(--background))] hover:border-[hsl(var(--primary))]/50 transition-all duration-300 group"
              >
                <div className="flex-1">
                  <p className="font-semibold text-lg mb-1">{title}</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{description}</p>
                </div>
                <Switch
                  checked={Boolean(settings[key as keyof UserSettings])}
                  onCheckedChange={() => handleToggle(key as keyof UserSettings)}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[hsl(var(--primary))] data-[state=checked]:to-green-500"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Privacy Section */}
        <section className="rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b-2 border-[hsl(var(--border))] p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Privacy</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Control your visibility</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between gap-4 p-5 rounded-xl border border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--background))]/50 to-[hsl(var(--background))] hover:border-[hsl(var(--primary))]/50 transition-all duration-300">
              <div className="flex-1">
                <p className="font-semibold text-lg mb-1">Public profile</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Allow your profile identity to be discoverable in the community.</p>
              </div>
              <Switch
                checked={settings.publicProfile}
                onCheckedChange={() => handleToggle("publicProfile")}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[hsl(var(--primary))] data-[state=checked]:to-green-500"
              />
            </div>
          </div>
        </section>

        {/* Region & Preferences Section */}
        <section className="rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden">
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b-2 border-[hsl(var(--border))] p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Region & Preferences</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Set your locale and currency</p>
              </div>
            </div>
          </div>

          <div className="p-6 grid sm:grid-cols-2 gap-5">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings((current) => ({ ...current, currency: e.target.value as "USD" | "NGN" }))}
                className="w-full rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3.5 font-medium text-lg hover:border-[hsl(var(--primary))]/50 focus:border-[hsl(var(--primary))] focus:outline-none transition-all"
              >
                <option value="USD">🇺🇸 USD - US Dollar</option>
                <option value="NGN">🇳🇬 NGN - Nigerian Naira</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings((current) => ({ ...current, timezone: e.target.value }))}
                className="w-full rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3.5 font-medium text-lg hover:border-[hsl(var(--primary))]/50 focus:border-[hsl(var(--primary))] focus:outline-none transition-all"
              >
                <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                <option value="UTC">UTC (GMT)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="America/New_York">America/New York (EST)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Wallet Section */}
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
          </div>
        </section>

        {/* Save Button */}
        <div className="flex items-center justify-center pt-4">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-[hsl(var(--primary))] to-green-500 text-white text-lg font-bold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
          >
            <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Save All Settings
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

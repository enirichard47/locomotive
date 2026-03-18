import type { DeliveryDetails } from "@shared/api";

export interface UserSettings {
  displayName: string;
  contactEmail: string;
  emailUpdates: boolean;
  orderAlerts: boolean;
  deliveryAlerts: boolean;
  requireCheckoutConfirmation: boolean;
  useSavedAddressByDefault: boolean;
  defaultDeliveryDetails: DeliveryDetails;
  currency: "USD" | "NGN";
  timezone: string;
}

const SETTINGS_KEY_PREFIX = "locomotive_user_settings_";

const isClient = typeof window !== "undefined";

const readJson = <T,>(key: string, fallback: T): T => {
  if (!isClient) {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = <T,>(key: string, value: T) => {
  if (!isClient) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

export const getDefaultSettings = (): UserSettings => ({
  displayName: "",
  contactEmail: "",
  emailUpdates: true,
  orderAlerts: true,
  deliveryAlerts: true,
  requireCheckoutConfirmation: true,
  useSavedAddressByDefault: true,
  defaultDeliveryDetails: {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  },
  currency: "USD",
  timezone: "Africa/Lagos",
});

const settingsKey = (walletAddress: string) =>
  `${SETTINGS_KEY_PREFIX}${walletAddress.toLowerCase()}`;

export const getUserSettings = (walletAddress: string): UserSettings =>
  ({
    ...getDefaultSettings(),
    ...readJson<Partial<UserSettings>>(settingsKey(walletAddress), {}),
  });

export const saveUserSettings = (walletAddress: string, settings: UserSettings) => {
  writeJson(settingsKey(walletAddress), settings);
};

import type { DeliveryDetails } from "@shared/api";

export type PaymentMethod = "payment-link";
export type OrderStatus =
  | "pending"
  | "processing"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface StoreOrder {
  id: string;
  walletAddress: string;
  itemName: string;
  collectionName: string;
  size?: string;
  color: string;
  quantity: number;
  unitPrice: number;
  total: number;
  image?: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  deliveryDetails: DeliveryDetails;
}

export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  image: string;
  path: string;
  comingSoon: boolean;
  basePrice: number;
  source: "default" | "admin";
}

const ORDERS_KEY = "locomotive_orders";
const COLLECTIONS_KEY = "locomotive_admin_collections";
const COLLECTION_OVERRIDES_KEY = "locomotive_default_collection_overrides";
const COLLECTION_DELETED_DEFAULTS_KEY = "locomotive_deleted_default_collections";

const ADMIN_WALLET_ADDRESS = "4LFaS625N8PjCC1zTyYEdrfvVrEHWTGuhe1dWxRhPcau";

const defaultCollections: CollectionItem[] = [
  {
    id: "default-hate",
    name: "Hate Collection",
    description:
      "Limited edition drops engineered for bold identities and unapologetic self-expression",
    image: "/hate.png",
    path: "/collections/hate",
    comingSoon: false,
    basePrice: 22,
    source: "default",
  },
  {
    id: "default-manga",
    name: "Manga Collection",
    description: "Anime-inspired graphics and vibrant colors. Launching soon.",
    image: "/locomotive_logo.png",
    path: "/collections/manga",
    comingSoon: true,
    basePrice: 54.99,
    source: "default",
  },
];

const isClient = typeof window !== "undefined";

const readJson = <T,>(key: string, fallback: T): T => {
  if (!isClient) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
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

export const normalizeWalletAddress = (value?: string | null) =>
  (value ?? "").replace(/\s+/g, "").trim().toLowerCase();

export const isAdminWallet = (walletAddress?: string | null) =>
  normalizeWalletAddress(walletAddress) ===
  normalizeWalletAddress(ADMIN_WALLET_ADDRESS);

export const getOrders = () => readJson<StoreOrder[]>(ORDERS_KEY, []);

export const saveOrder = (order: StoreOrder) => {
  const current = getOrders();
  writeJson(ORDERS_KEY, [order, ...current]);
};

export const updateOrderStatus = (orderId: string, status: OrderStatus) => {
  const current = getOrders();
  const next = current.map((order) =>
    order.id === orderId ? { ...order, status } : order,
  );
  writeJson(ORDERS_KEY, next);
};

export const getAdminCollections = () =>
  readJson<CollectionItem[]>(COLLECTIONS_KEY, []);

export const addAdminCollection = (
  collection: Omit<CollectionItem, "id" | "source">,
) => {
  const slug = collection.path.startsWith("/collections/")
    ? collection.path
    : `/collections/${collection.path.replace(/^\/+/, "")}`;

  const current = getAdminCollections();
  const nextItem: CollectionItem = {
    ...collection,
    path: slug,
    id: `admin-${crypto.randomUUID()}`,
    source: "admin",
  };

  writeJson(COLLECTIONS_KEY, [nextItem, ...current]);
  return nextItem;
};

export const updateAdminCollection = (
  id: string,
  updates: Partial<Omit<CollectionItem, "id" | "source">>,
) => {
  if (id.startsWith("default-")) {
    const currentOverrides = readJson<
      Record<string, Partial<Omit<CollectionItem, "id" | "source">>>
    >(COLLECTION_OVERRIDES_KEY, {});

    const mergedOverrides = {
      ...currentOverrides,
      [id]: {
        ...(currentOverrides[id] ?? {}),
        ...updates,
      },
    };

    writeJson(COLLECTION_OVERRIDES_KEY, mergedOverrides);

    // If a default collection was previously deleted, editing it restores it.
    const deletedDefaultIds = readJson<string[]>(COLLECTION_DELETED_DEFAULTS_KEY, []);
    if (deletedDefaultIds.includes(id)) {
      writeJson(
        COLLECTION_DELETED_DEFAULTS_KEY,
        deletedDefaultIds.filter((itemId) => itemId !== id),
      );
    }

    return;
  }

  const current = getAdminCollections();
  const next = current.map((item) => {
    if (item.id !== id) {
      return item;
    }

    const nextPath = updates.path
      ? updates.path.startsWith("/collections/")
        ? updates.path
        : `/collections/${updates.path.replace(/^\/+/, "")}`
      : item.path;

    return {
      ...item,
      ...updates,
      path: nextPath,
    };
  });

  writeJson(COLLECTIONS_KEY, next);
};

export const deleteAdminCollection = (id: string) => {
  if (id.startsWith("default-")) {
    const deletedDefaultIds = readJson<string[]>(COLLECTION_DELETED_DEFAULTS_KEY, []);
    if (!deletedDefaultIds.includes(id)) {
      writeJson(COLLECTION_DELETED_DEFAULTS_KEY, [...deletedDefaultIds, id]);
    }
    return;
  }

  const current = getAdminCollections();
  const next = current.filter((item) => item.id !== id);
  writeJson(COLLECTIONS_KEY, next);
};

export const getAllCollections = () => {
  const defaultOverrides = readJson<
    Record<string, Partial<Omit<CollectionItem, "id" | "source">>>
  >(COLLECTION_OVERRIDES_KEY, {});

  const mergedDefaults = defaultCollections.map((collection) => {
    const overrides = defaultOverrides[collection.id] ?? {};
    const nextPath = overrides.path
      ? overrides.path.startsWith("/collections/")
        ? overrides.path
        : `/collections/${overrides.path.replace(/^\/+/, "")}`
      : collection.path;

    return {
      ...collection,
      ...overrides,
      path: nextPath,
      source: "default" as const,
    };
  });

  const deletedDefaultIds = readJson<string[]>(COLLECTION_DELETED_DEFAULTS_KEY, []);
  const visibleDefaults = mergedDefaults.filter(
    (collection) => !deletedDefaultIds.includes(collection.id),
  );

  return [...visibleDefaults, ...getAdminCollections()];
};

export const getCollectionBySlug = (slug?: string) => {
  if (!slug) {
    return null;
  }

  const path = `/collections/${slug}`;
  return getAllCollections().find((item) => item.path === path) ?? null;
};

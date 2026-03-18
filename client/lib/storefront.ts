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

export const normalizeWalletAddress = (value?: string | null) =>
  (value ?? "").replace(/\s+/g, "").trim().toLowerCase();

const parseJson = async <T,>(response: Response): Promise<T> => {
  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  return JSON.parse(text) as T;
};

const ensureOk = async (response: Response, fallbackMessage: string) => {
  if (response.ok) {
    return;
  }

  const payload = await parseJson<{ error?: string }>(response).catch(
    () => ({ error: undefined as string | undefined }),
  );
  throw new Error(payload.error || fallbackMessage);
};

export const getOrders = async (walletAddress?: string | null): Promise<StoreOrder[]> => {
  const query = walletAddress ? `?walletAddress=${encodeURIComponent(normalizeWalletAddress(walletAddress))}` : "";
  const response = await fetch(`/api/orders${query}`);
  await ensureOk(response, "Failed to load orders");
  const payload = await parseJson<{ orders?: StoreOrder[] }>(response);
  return payload.orders || [];
};

export const saveOrder = async (order: StoreOrder) => {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });

  await ensureOk(response, "Failed to save order");
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  await ensureOk(response, "Failed to update order status");
};

export const getAllCollections = async (): Promise<CollectionItem[]> => {
  const response = await fetch("/api/collections");
  await ensureOk(response, "Failed to load collections");
  const payload = await parseJson<{ collections?: CollectionItem[] }>(response);
  return payload.collections || [];
};

export const addAdminCollection = async (
  collection: Omit<CollectionItem, "id" | "source">,
): Promise<CollectionItem> => {
  const response = await fetch("/api/admin/collections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(collection),
  });

  await ensureOk(response, "Failed to create collection");
  const payload = await parseJson<{ collection: CollectionItem }>(response);
  return payload.collection;
};

export const updateAdminCollection = async (
  id: string,
  updates: Partial<Omit<CollectionItem, "id" | "source">>,
) => {
  const response = await fetch(`/api/admin/collections/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  await ensureOk(response, "Failed to update collection");
};

export const deleteAdminCollection = async (id: string) => {
  const response = await fetch(`/api/admin/collections/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  await ensureOk(response, "Failed to delete collection");
};

export const getCollectionBySlug = async (slug?: string): Promise<CollectionItem | null> => {
  if (!slug) {
    return null;
  }

  const response = await fetch(`/api/collections/${encodeURIComponent(slug)}`);
  if (response.status === 404) {
    return null;
  }

  await ensureOk(response, "Failed to load collection");
  const payload = await parseJson<{ collection?: CollectionItem }>(response);
  return payload.collection || null;
};

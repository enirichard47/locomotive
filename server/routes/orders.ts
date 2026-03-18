import { RequestHandler } from "express";
import { supabaseServer } from "../supabase";

type OrderRow = {
  id: string;
  wallet_address: string;
  item_name: string;
  collection_name: string;
  size: string | null;
  color: string;
  quantity: number;
  unit_price: number;
  total: number;
  image: string | null;
  payment_method: "payment-link";
  status: "pending" | "processing" | "paid" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  delivery_full_name: string;
  delivery_email: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_postal_code: string;
  delivery_country: string;
};

const isMissingTableError = (error: { code?: string; message?: string } | null) =>
  Boolean(error && (error.code === "PGRST205" || /Could not find the table/i.test(error.message || "")));

const toStoreOrder = (row: OrderRow) => ({
  id: row.id,
  walletAddress: row.wallet_address,
  itemName: row.item_name,
  collectionName: row.collection_name,
  size: row.size || undefined,
  color: row.color,
  quantity: row.quantity,
  unitPrice: Number(row.unit_price),
  total: Number(row.total),
  image: row.image || undefined,
  paymentMethod: row.payment_method,
  status: row.status,
  createdAt: row.created_at,
  deliveryDetails: {
    fullName: row.delivery_full_name,
    email: row.delivery_email,
    phone: row.delivery_phone,
    address: row.delivery_address,
    city: row.delivery_city,
    state: row.delivery_state,
    postalCode: row.delivery_postal_code,
    country: row.delivery_country,
  },
});

export const handleGetOrders: RequestHandler = async (req, res) => {
  const auth = res.locals.auth as { walletAddress?: string; isAdmin?: boolean } | undefined;
  const sessionWalletAddress = auth?.walletAddress?.trim().toLowerCase();
  const isAdmin = Boolean(auth?.isAdmin);
  const walletAddress = typeof req.query.walletAddress === "string" ? req.query.walletAddress : undefined;

  if (!sessionWalletAddress) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!isAdmin && walletAddress && walletAddress.trim().toLowerCase() !== sessionWalletAddress) {
    return res.status(403).json({ error: "Cannot read orders for another wallet" });
  }

  let query = supabaseServer
    .from("orders")
    .select("id, wallet_address, item_name, collection_name, size, color, quantity, unit_price, total, image, payment_method, status, created_at, delivery_full_name, delivery_email, delivery_phone, delivery_address, delivery_city, delivery_state, delivery_postal_code, delivery_country")
    .order("created_at", { ascending: false });

  if (!isAdmin) {
    query = query.eq("wallet_address", sessionWalletAddress);
  } else if (walletAddress) {
    query = query.eq("wallet_address", walletAddress.trim().toLowerCase());
  }

  const { data, error } = await query;

  if (error) {
    if (isMissingTableError(error)) {
      return res.status(200).json({ orders: [] });
    }
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ orders: (data || []).map((item) => toStoreOrder(item as OrderRow)) });
};

export const handleCreateOrder: RequestHandler = async (req, res) => {
  const auth = res.locals.auth as { walletAddress?: string } | undefined;
  const sessionWalletAddress = auth?.walletAddress?.trim().toLowerCase();

  if (!sessionWalletAddress) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const order = req.body as {
    id?: string;
    walletAddress?: string;
    itemName?: string;
    collectionName?: string;
    size?: string;
    color?: string;
    quantity?: number;
    unitPrice?: number;
    total?: number;
    image?: string;
    paymentMethod?: "payment-link";
    status?: "pending" | "processing" | "paid" | "shipped" | "delivered" | "cancelled";
    createdAt?: string;
    deliveryDetails?: {
      fullName?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };

  if (!order.id || !order.walletAddress || !order.itemName || !order.collectionName || !order.color || !order.deliveryDetails) {
    return res.status(400).json({ error: "Missing required order fields" });
  }

  if (order.walletAddress.trim().toLowerCase() !== sessionWalletAddress) {
    return res.status(403).json({ error: "Order wallet must match authenticated wallet" });
  }

  const details = order.deliveryDetails;
  if (!details.fullName || !details.email || !details.phone || !details.address || !details.city || !details.state || !details.postalCode || !details.country) {
    return res.status(400).json({ error: "Missing required delivery fields" });
  }

  const { error } = await supabaseServer.from("orders").insert({
    id: order.id,
    wallet_address: order.walletAddress.trim().toLowerCase(),
    item_name: order.itemName,
    collection_name: order.collectionName,
    size: order.size || null,
    color: order.color,
    quantity: Number(order.quantity) || 1,
    unit_price: Number(order.unitPrice) || 0,
    total: Number(order.total) || 0,
    image: order.image || null,
    payment_method: order.paymentMethod || "payment-link",
    status: order.status || "pending",
    created_at: order.createdAt || new Date().toISOString(),
    delivery_full_name: details.fullName,
    delivery_email: details.email,
    delivery_phone: details.phone,
    delivery_address: details.address,
    delivery_city: details.city,
    delivery_state: details.state,
    delivery_postal_code: details.postalCode,
    delivery_country: details.country,
  });

  if (error) {
    if (isMissingTableError(error)) {
      return res.status(500).json({ error: "Supabase orders table is missing. Run the SQL setup query in Supabase SQL Editor." });
    }
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ success: true });
};

export const handleUpdateOrderStatus: RequestHandler = async (req, res) => {
  const id = req.params.id;
  const status = req.body?.status as OrderRow["status"] | undefined;

  if (!id || !status) {
    return res.status(400).json({ error: "id and status are required" });
  }

  const { error } = await supabaseServer.from("orders").update({ status }).eq("id", id);

  if (error) {
    if (isMissingTableError(error)) {
      return res.status(500).json({ error: "Supabase orders table is missing. Run the SQL setup query in Supabase SQL Editor." });
    }
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
};

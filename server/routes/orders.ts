import { RequestHandler } from "express";
import { supabaseServer } from "../supabase";
import { createRedspeedShipmentForOrder } from "./redspeed";
import { fetchDogemeatSession, fetchStoredCheckoutSession, isSuccessfulDogemeatPayment } from "./dogemeatpay";

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
  redspeed_recipient_city_code: string | null;
  redspeed_recipient_town_id: number | null;
  redspeed_delivery_fee: number | null;
  redspeed_waybill_number: string | null;
  redspeed_tracking_status: string | null;
  redspeed_last_tracking_at: string | null;
};

type CheckoutDeliveryDetails = {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

type CheckoutMetadata = {
  orderId?: string;
  walletAddress?: string;
  itemName?: string;
  collectionName?: string;
  image?: string;
  quantity?: number;
  selectedColor?: string;
  unitPrice?: number;
  subtotal?: number;
  shipping?: number;
  tax?: number;
  total?: number;
  deliveryDetails?: CheckoutDeliveryDetails;
  deliveryFeeUsd?: number;
  deliveryFeeNgn?: number;
  fxRateNgnPerUsd?: number;
  shippingWeightKg?: number;
  redspeed?: {
    recipientCity?: string;
    recipientTownId?: number;
    deliveryFee?: number;
  };
  promo?: string;
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
  redspeed: {
    recipientCityCode: row.redspeed_recipient_city_code || undefined,
    recipientTownId: row.redspeed_recipient_town_id ?? undefined,
    deliveryFee: row.redspeed_delivery_fee ?? undefined,
    waybillNumber: row.redspeed_waybill_number || undefined,
    trackingStatus: row.redspeed_tracking_status || undefined,
    lastTrackingAt: row.redspeed_last_tracking_at || undefined,
  },
});

const buildOrderInsertFromMetadata = (orderId: string, metadata: CheckoutMetadata | undefined) => {
  if (!metadata?.walletAddress || !metadata.itemName || !metadata.collectionName || !metadata.selectedColor || !metadata.deliveryDetails) {
    return null;
  }

  const details = metadata.deliveryDetails;
  if (!details.fullName || !details.email || !details.phone || !details.address || !details.city || !details.state || !details.postalCode || !details.country) {
    return null;
  }

  return {
    id: orderId,
    wallet_address: metadata.walletAddress.trim().toLowerCase(),
    item_name: metadata.itemName,
    collection_name: metadata.collectionName,
    size: null,
    color: metadata.selectedColor,
    quantity: Number(metadata.quantity) || 1,
    unit_price: Number(metadata.unitPrice) || 0,
    total: Number(metadata.total) || 0,
    image: metadata.image || null,
    payment_method: "payment-link" as const,
    status: "paid" as const,
    created_at: new Date().toISOString(),
    delivery_full_name: details.fullName,
    delivery_email: details.email,
    delivery_phone: details.phone,
    delivery_address: details.address,
    delivery_city: details.city,
    delivery_state: details.state,
    delivery_postal_code: details.postalCode,
    delivery_country: details.country,
    redspeed_recipient_city_code: metadata.redspeed?.recipientCity || null,
    redspeed_recipient_town_id:
      typeof metadata.redspeed?.recipientTownId === "number" ? metadata.redspeed.recipientTownId : null,
    redspeed_delivery_fee:
      typeof metadata.deliveryFeeUsd === "number" ? metadata.deliveryFeeUsd : null,
  };
};

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
    .select("id, wallet_address, item_name, collection_name, size, color, quantity, unit_price, total, image, payment_method, status, created_at, delivery_full_name, delivery_email, delivery_phone, delivery_address, delivery_city, delivery_state, delivery_postal_code, delivery_country, redspeed_recipient_city_code, redspeed_recipient_town_id, redspeed_delivery_fee, redspeed_waybill_number, redspeed_tracking_status, redspeed_last_tracking_at")
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
    redspeed?: {
      recipientCityCode?: string;
      recipientTownId?: number;
      deliveryFee?: number;
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
    redspeed_recipient_city_code: order.redspeed?.recipientCityCode || null,
    redspeed_recipient_town_id:
      typeof order.redspeed?.recipientTownId === "number" ? order.redspeed.recipientTownId : null,
    redspeed_delivery_fee:
      typeof order.redspeed?.deliveryFee === "number" ? order.redspeed.deliveryFee : null,
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

export const handleClearAllOrders: RequestHandler = async (_req, res) => {
  const { data, error } = await supabaseServer
    .from("orders")
    .delete()
    .neq("id", "__clear_all_orders__")
    .select("id");

  if (error) {
    if (isMissingTableError(error)) {
      return res.status(500).json({ error: "Supabase orders table is missing. Run the SQL setup query in Supabase SQL Editor." });
    }
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true, deletedCount: data?.length || 0 });
};

export const handleConfirmPaidOrder: RequestHandler = async (req, res) => {
  const auth = res.locals.auth as { walletAddress?: string; isAdmin?: boolean } | undefined;
  const sessionWalletAddress = auth?.walletAddress?.trim().toLowerCase();
  const isAdmin = Boolean(auth?.isAdmin);
  const orderId = typeof req.params.id === "string" ? req.params.id : Array.isArray(req.params.id) ? req.params.id[0] : "";

  if (!sessionWalletAddress) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!orderId) {
    return res.status(400).json({ error: "id is required" });
  }

  const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId.trim() : "";
  const metadata = req.body?.metadata as CheckoutMetadata | undefined;
  let resolvedSessionId = sessionId;
  let resolvedMetadata = metadata;

  if (!resolvedSessionId || !resolvedMetadata) {
    const storedSession = await fetchStoredCheckoutSession({ orderId });

    if (storedSession) {
      if (!resolvedSessionId) {
        resolvedSessionId = storedSession.session_id;
      }

      if (!resolvedMetadata) {
        resolvedMetadata = storedSession.metadata as CheckoutMetadata;
      }
    }
  }

  if (!resolvedSessionId || !resolvedMetadata) {
    return res.status(400).json({ error: "Missing paid order details in checkout metadata" });
  }

  if (resolvedSessionId) {
    const session = await fetchDogemeatSession(resolvedSessionId);
    if (!isSuccessfulDogemeatPayment(session)) {
      return res.status(409).json({
        error: "Dogemeat session is not marked as paid yet.",
        sessionStatus: session.status || session.paymentStatus || session.checkoutStatus || session.sessionStatus || null,
      });
    }
  }

  const { data: existingOrder, error: loadOrderError } = await supabaseServer
    .from("orders")
    .select("id, wallet_address, status, redspeed_waybill_number")
    .eq("id", orderId)
    .maybeSingle();

  if (loadOrderError) {
    return res.status(500).json({ error: loadOrderError.message });
  }

  if (!existingOrder) {
    const orderInsert = buildOrderInsertFromMetadata(orderId, resolvedMetadata);
    if (!orderInsert) {
      return res.status(400).json({ error: "Missing paid order details in checkout metadata" });
    }

    if (!isAdmin && orderInsert.wallet_address !== sessionWalletAddress) {
      return res.status(403).json({ error: "Cannot confirm payment for another wallet" });
    }

    const { error: insertError } = await supabaseServer.from("orders").insert(orderInsert);

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }
  } else {
    if (!isAdmin && existingOrder.wallet_address.trim().toLowerCase() !== sessionWalletAddress) {
      return res.status(403).json({ error: "Cannot confirm payment for another wallet" });
    }

    const { error: updateError } = await supabaseServer
      .from("orders")
      .update({ status: "paid" })
      .eq("id", orderId);

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }
  }

  let pickupResult: Awaited<ReturnType<typeof createRedspeedShipmentForOrder>> | null = null;
  if (!existingOrder?.redspeed_waybill_number) {
    try {
      pickupResult = await createRedspeedShipmentForOrder(String(orderId), resolvedMetadata);
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to create RedSpeed shipment",
        paid: true,
      });
    }
  }

  return res.status(200).json({ success: true, paid: true, pickupResult });
};

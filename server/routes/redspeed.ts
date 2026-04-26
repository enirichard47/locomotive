import type { RequestHandler } from "express";
import { supabaseServer } from "../supabase";

const REDSPEED_API_BASE_URL = (
  process.env.REDSPEED_API_BASE_URL || "http://redspeedopenapi.redstarplc.com"
).replace(/\/$/, "");
const REDSPEED_REQUEST_TIMEOUT_MS = Number(process.env.REDSPEED_REQUEST_TIMEOUT_MS || "12000");
const REDSPEED_MAX_RETRIES = Math.max(0, Number(process.env.REDSPEED_MAX_RETRIES || "2"));
const REDSPEED_API_KEY = (
  process.env.REDSPEED_API_KEY ||
  process.env.REDSPEED_SECRET_KEY ||
  process.env.VITE_REDSPEED_API_KEY ||
  ""
)
  .trim()
  .replace(/^['"]|['"]$/g, "");

const REDSPEED_SENDER_CITY = (process.env.REDSPEED_SENDER_CITY || "LAGOS").trim();
const REDSPEED_SENDER_TOWN_ID = Number(process.env.REDSPEED_SENDER_TOWN_ID || "");
const REDSPEED_SENDER_NAME = (process.env.REDSPEED_SENDER_NAME || "Locomotive").trim();
const REDSPEED_SENDER_ADDRESS = (process.env.REDSPEED_SENDER_ADDRESS || "Lagos").trim();
const REDSPEED_SENDER_PHONE = (process.env.REDSPEED_SENDER_PHONE || "").trim();
const REDSPEED_PICKUP_TYPE = Number(process.env.REDSPEED_PICKUP_TYPE || "1");
const REDSPEED_DEFAULT_PAYMENT_TYPE = (process.env.REDSPEED_DEFAULT_PAYMENT_TYPE || "Prepaid").trim();
const REDSPEED_DEFAULT_WEIGHT = Number(process.env.REDSPEED_DEFAULT_WEIGHT || "1");
const REDSPEED_FX_NGN_PER_USD = Number(process.env.REDSPEED_FX_NGN_PER_USD || "1600");
const REDSPEED_FX_BUFFER_PERCENT = Number(process.env.REDSPEED_FX_BUFFER_PERCENT || "2");

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

type RedspeedCityIdentity = {
  abbr: string;
  name: string;
};

type OrderDeliveryRow = {
  id: string;
  item_name: string;
  collection_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  status: string;
  delivery_full_name: string;
  delivery_email: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_postal_code: string;
  redspeed_waybill_number: string | null;
};

type ShipmentMetadata = {
  quantity?: number;
  redspeed?: {
    recipientCity?: string;
    recipientTownId?: number;
  };
};

type DeliveryFeeRequest = {
  senderCity?: string;
  recipientCity?: string;
  recipientTownID?: number;
  senderTownID?: number;
  pickupType?: number;
  weight?: number;
};

const parseResponseBody = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

class RedspeedRequestError extends Error {
  statusCode: number;
  kind: "provider" | "network";
  providerStatus?: number;
  providerPayload?: unknown;

  constructor(
    message: string,
    statusCode: number,
    kind: "provider" | "network",
    details?: { providerStatus?: number; providerPayload?: unknown },
  ) {
    super(message);
    this.name = "RedspeedRequestError";
    this.statusCode = statusCode;
    this.kind = kind;
    this.providerStatus = details?.providerStatus;
    this.providerPayload = details?.providerPayload;
  }
}

const getFallbackBaseUrl = (baseUrl: string) => {
  if (baseUrl.startsWith("http://")) {
    return `https://${baseUrl.slice("http://".length)}`;
  }
  if (baseUrl.startsWith("https://")) {
    return `http://${baseUrl.slice("https://".length)}`;
  }
  return baseUrl;
};

const isTransientNetworkError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === "AbortError" ||
    /fetch failed|network|econnrefused|etimedout|unable to connect/i.test(error.message)
  );
};

const mapRedspeedError = (error: unknown, fallbackMessage: string) => {
  if (error instanceof RedspeedRequestError) {
    if (error.kind === "network") {
      return {
        status: error.statusCode,
        body: {
          error: "RedSpeed service is temporarily unreachable. Please retry in a moment.",
          details: error.message,
        },
      };
    }

    return {
      status: error.statusCode,
      body: {
        error: error.message,
        providerStatus: error.providerStatus,
        providerResponse: error.providerPayload,
      },
    };
  }

  return {
    status: 500,
    body: {
      error: error instanceof Error ? error.message : fallbackMessage,
    },
  };
};

const requestRedspeed = async (path: string, options?: RequestInit) => {
  if (!REDSPEED_API_KEY) {
    throw new Error(
      "Missing RedSpeed API key in server environment. Set REDSPEED_API_KEY (or REDSPEED_SECRET_KEY) and restart the server process.",
    );
  }

  const headers = new Headers(options?.headers || {});
  headers.set("X-API-KEY", REDSPEED_API_KEY);
  if (!headers.has("Content-Type") && options?.body) {
    headers.set("Content-Type", "application/json");
  }

  const baseCandidates = [REDSPEED_API_BASE_URL, getFallbackBaseUrl(REDSPEED_API_BASE_URL)].filter(
    (value, index, list) => Boolean(value) && list.indexOf(value) === index,
  );

  const timeoutMs =
    Number.isFinite(REDSPEED_REQUEST_TIMEOUT_MS) && REDSPEED_REQUEST_TIMEOUT_MS > 0
      ? REDSPEED_REQUEST_TIMEOUT_MS
      : 12000;
  let lastError: Error | null = null;

  for (const baseUrl of baseCandidates) {
    for (let attempt = 1; attempt <= REDSPEED_MAX_RETRIES + 1; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(`${baseUrl}${path}`, {
          ...options,
          headers,
          signal: controller.signal,
        });

        const payload = await parseResponseBody(response);
        if (!response.ok) {
          const errorText =
            typeof payload === "string"
              ? payload
              : JSON.stringify(payload || { message: response.statusText });
          throw new RedspeedRequestError(
            `RedSpeed API error (${response.status}): ${errorText}`,
            502,
            "provider",
            { providerStatus: response.status, providerPayload: payload },
          );
        }

        clearTimeout(timeoutId);
        return payload;
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof RedspeedRequestError) {
          throw error;
        }

        if (!isTransientNetworkError(error)) {
          throw error;
        }

        const message = error instanceof Error ? error.message : "Unknown network error";
        lastError = new RedspeedRequestError(
          `RedSpeed network error via ${baseUrl} (attempt ${attempt}/${REDSPEED_MAX_RETRIES + 1}): ${message}`,
          503,
          "network",
        );

        const canRetry = attempt < REDSPEED_MAX_RETRIES + 1;
        if (!canRetry) {
          break;
        }
      }
    }
  }

  throw lastError || new RedspeedRequestError("RedSpeed network error", 503, "network");
};

const extractWaybillNumber = (payload: unknown): string | undefined => {
  if (!payload) {
    return undefined;
  }

  if (typeof payload === "string") {
    return payload.trim() || undefined;
  }

  if (Array.isArray(payload)) {
    for (const entry of payload) {
      const candidate = extractWaybillNumber(entry);
      if (candidate) {
        return candidate;
      }
    }
    return undefined;
  }

  if (typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const direct =
      record.waybillNumber ||
      record.waybillNo ||
      record.waybill ||
      record.waybillno ||
      record.WaybillNo ||
      record.WaybillNumber;

    if (typeof direct === "string" && direct.trim()) {
      return direct.trim();
    }

    for (const value of Object.values(record)) {
      const nested = extractWaybillNumber(value);
      if (nested) {
        return nested;
      }
    }
  }

  return undefined;
};

const normalizeTownId = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const extractNumericValue = (payload: unknown): number | null => {
  if (typeof payload === "number" && Number.isFinite(payload)) {
    return payload;
  }

  if (typeof payload === "string") {
    const parsed = Number(payload);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const candidates = [
    record.amount,
    record.fee,
    record.deliveryFee,
    record.delivery_fee,
    record.totalAmount,
    record.total_amount,
    record.price,
    record.cost,
    record.value,
  ];

  for (const candidate of candidates) {
    const nextValue = extractNumericValue(candidate);
    if (nextValue !== null) {
      return nextValue;
    }
  }

  for (const candidate of Object.values(record)) {
    const nextValue = extractNumericValue(candidate);
    if (nextValue !== null) {
      return nextValue;
    }
  }

  return null;
};

const resolveDeliveryFee = (payload: unknown): number | null => {
  if (typeof payload === "number" || typeof payload === "string") {
    return extractNumericValue(payload);
  }

  if (Array.isArray(payload)) {
    for (const entry of payload) {
      const nextValue = resolveDeliveryFee(entry);
      if (nextValue !== null) {
        return nextValue;
      }
    }
    return null;
  }

  return extractNumericValue(payload);
};

const normalizeCityToken = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

const CITY_ALIASES: Record<string, string> = {
  "lagos mainland": "MLD",
  "lagos island": "ISL",
  lagos: "MLD",
};

const normalizeCityCode = (value?: string) => {
  if (!value) {
    return "";
  }
  const normalized = value.trim().toUpperCase();
  return /^[A-Z]{2,5}$/.test(normalized) ? normalized : "";
};

const loadRedspeedCities = async () => {
  const payload = await requestRedspeed("/api/Operations/Cities");
  const cities = Array.isArray(payload) ? (payload as RedspeedCity[]) : [];
  return cities.filter((city) => {
    const abbr = typeof city.abbr === "string" ? city.abbr.trim() : "";
    const name = typeof city.name === "string" ? city.name.trim() : "";
    return Boolean(abbr || name);
  });
};

const toCityIdentity = (city: RedspeedCity): RedspeedCityIdentity | null => {
  const abbr = typeof city.abbr === "string" ? city.abbr.trim() : "";
  const name = typeof city.name === "string" ? city.name.trim() : "";
  if (!abbr || !name) {
    return null;
  }
  return { abbr, name };
};

const resolveRedspeedCityIdentity = async (input: string): Promise<RedspeedCityIdentity | null> => {
  const normalizedInput = normalizeCityToken(input);
  if (!normalizedInput) {
    return null;
  }

  let cities: RedspeedCity[] = [];
  try {
    cities = await loadRedspeedCities();
  } catch {
    return null;
  }

  const directCode = normalizeCityCode(input);
  if (directCode) {
    const matchedByCode = cities.find(
      (city) => typeof city.abbr === "string" && city.abbr.trim().toUpperCase() === directCode,
    );
    const identity = matchedByCode ? toCityIdentity(matchedByCode) : null;
    if (identity) {
      return identity;
    }
  }

  const alias = CITY_ALIASES[normalizedInput];
  if (alias) {
    const matchedByAlias = cities.find(
      (city) => typeof city.abbr === "string" && city.abbr.trim().toUpperCase() === alias,
    );
    const identity = matchedByAlias ? toCityIdentity(matchedByAlias) : null;
    if (identity) {
      return identity;
    }
  }

  const exactByAbbr = cities.find(
    (city) => typeof city.abbr === "string" && normalizeCityToken(city.abbr) === normalizedInput,
  );
  const exactByAbbrIdentity = exactByAbbr ? toCityIdentity(exactByAbbr) : null;
  if (exactByAbbrIdentity) {
    return exactByAbbrIdentity;
  }

  const exactByName = cities.find(
    (city) => typeof city.name === "string" && normalizeCityToken(city.name) === normalizedInput,
  );
  const exactByNameIdentity = exactByName ? toCityIdentity(exactByName) : null;
  if (exactByNameIdentity) {
    return exactByNameIdentity;
  }

  const partialByName = cities.find(
    (city) => typeof city.name === "string" && normalizeCityToken(city.name).includes(normalizedInput),
  );
  const partialByNameIdentity = partialByName ? toCityIdentity(partialByName) : null;
  if (partialByNameIdentity) {
    return partialByNameIdentity;
  }

  return null;
};

const resolveRedspeedCityCode = async (input: string) => {
  const identity = await resolveRedspeedCityIdentity(input);
  if (identity?.abbr) {
    return identity.abbr;
  }
  return "";
};

const convertNgnToUsd = (amountNgn: number) => {
  const fxRate = Number.isFinite(REDSPEED_FX_NGN_PER_USD) && REDSPEED_FX_NGN_PER_USD > 0
    ? REDSPEED_FX_NGN_PER_USD
    : 1600;
  const bufferPercent = Number.isFinite(REDSPEED_FX_BUFFER_PERCENT) && REDSPEED_FX_BUFFER_PERCENT >= 0
    ? REDSPEED_FX_BUFFER_PERCENT
    : 2;
  const bufferMultiplier = 1 + bufferPercent / 100;
  const usdWithBuffer = (amountNgn / fxRate) * bufferMultiplier;

  return {
    fxRateNgnPerUsd: fxRate,
    fxBufferPercent: bufferPercent,
    deliveryFeeUsd: Math.ceil(usdWithBuffer * 100) / 100,
  };
};

const extractStatusText = (shipment?: Record<string, unknown>) => {
  if (!shipment) {
    return "";
  }

  const candidates: string[] = [];

  if (typeof shipment.deliveryComment === "string") {
    candidates.push(shipment.deliveryComment);
  }
  if (typeof shipment.status === "string") {
    candidates.push(shipment.status);
  }
  if (typeof shipment.statusDescription === "string") {
    candidates.push(shipment.statusDescription);
  }
  if (typeof shipment.exception === "string") {
    candidates.push(shipment.exception);
  }

  if (Array.isArray(shipment.pStatus)) {
    for (const entry of shipment.pStatus) {
      if (!entry || typeof entry !== "object") {
        continue;
      }
      const record = entry as Record<string, unknown>;
      if (record.value === true && typeof record.name === "string") {
        candidates.push(record.name);
      }
    }
  }

  return candidates.join(" ").trim();
};

const mapTrackingToOrderStatus = (statusText: string, lastStatus?: unknown) => {
  const normalized = statusText.toLowerCase();

  if (
    normalized.includes("delivered") ||
    normalized.includes("delivery successful") ||
    normalized.includes("proof of delivery")
  ) {
    return "delivered" as const;
  }

  if (
    normalized.includes("in transit") ||
    normalized.includes("out for delivery") ||
    normalized.includes("dispatched") ||
    normalized.includes("on transit") ||
    normalized.includes("arrived") ||
    normalized.includes("departure") ||
    normalized.includes("hub")
  ) {
    return "shipped" as const;
  }

  if (
    normalized.includes("pickup") ||
    normalized.includes("booked") ||
    normalized.includes("created") ||
    normalized.includes("accepted") ||
    normalized.includes("manifest") ||
    normalized.includes("waybill")
  ) {
    return "processing" as const;
  }

  if (typeof lastStatus === "number") {
    // Fallback: high numeric statuses typically represent final delivery states.
    if (lastStatus >= 80) {
      return "delivered" as const;
    }
    if (lastStatus >= 40) {
      return "shipped" as const;
    }
    if (lastStatus > 0) {
      return "processing" as const;
    }
  }

  return null;
};

const syncRedspeedShipmentByWaybill = async (waybillNumber: string) => {
  const normalizedWaybillNumber = waybillNumber.trim();
  if (!normalizedWaybillNumber) {
    throw new Error("waybillNumber is required");
  }

  const payload = await requestRedspeed(
    `/api/Operations/TrackShipment?Waybillno=${encodeURIComponent(normalizedWaybillNumber)}`,
  );

  const shipments = Array.isArray(payload) ? payload : [];
  const firstShipment = shipments[0] as Record<string, unknown> | undefined;
  const statusText = extractStatusText(firstShipment);
  const trackingStatus = statusText || "Tracking updated";
  const mappedOrderStatus = mapTrackingToOrderStatus(trackingStatus, firstShipment?.lastStatus);

  const updatePayload: {
    redspeed_tracking_status: string;
    redspeed_last_tracking_at: string;
    status?: "processing" | "shipped" | "delivered";
  } = {
    redspeed_tracking_status: trackingStatus,
    redspeed_last_tracking_at: new Date().toISOString(),
  };

  if (mappedOrderStatus) {
    updatePayload.status = mappedOrderStatus;
  }

  const { error } = await supabaseServer
    .from("orders")
    .update(updatePayload)
    .eq("redspeed_waybill_number", normalizedWaybillNumber);

  if (error) {
    throw new Error(`Failed to persist RedSpeed tracking update: ${error.message}`);
  }

  return {
    shipments,
    trackingStatus,
    mappedOrderStatus,
  };
};

export const createRedspeedShipmentForOrder = async (orderId: string, metadata?: ShipmentMetadata) => {
  const { data: order, error } = await supabaseServer
    .from("orders")
    .select("id, item_name, collection_name, quantity, unit_price, total, status, delivery_full_name, delivery_email, delivery_phone, delivery_address, delivery_city, delivery_state, delivery_postal_code, redspeed_waybill_number")
    .eq("id", orderId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load order for RedSpeed shipment: ${error.message}`);
  }

  const typedOrder = order as OrderDeliveryRow | null;
  if (!typedOrder) {
    throw new Error("Order not found for RedSpeed shipment creation.");
  }

  if (typedOrder.redspeed_waybill_number) {
    return {
      waybillNumber: typedOrder.redspeed_waybill_number,
      alreadyExists: true,
    };
  }

  const recipientCity =
    metadata?.redspeed?.recipientCity?.trim() || typedOrder.delivery_city.trim();
  const recipientTownId = normalizeTownId(metadata?.redspeed?.recipientTownId);
  const senderTownId = normalizeTownId(REDSPEED_SENDER_TOWN_ID);
  const pieces =
    Number(metadata?.quantity) > 0 ? Number(metadata?.quantity) : typedOrder.quantity;
  const shipmentWeight = Number.isFinite(REDSPEED_DEFAULT_WEIGHT) && REDSPEED_DEFAULT_WEIGHT > 0
    ? REDSPEED_DEFAULT_WEIGHT
    : 1;

  const senderCityIdentity = await resolveRedspeedCityIdentity(REDSPEED_SENDER_CITY);
  const recipientCityIdentity = await resolveRedspeedCityIdentity(recipientCity);
  const senderCity = senderCityIdentity?.name || "";
  const resolvedRecipientCity = recipientCityIdentity?.name || "";

  if (!recipientTownId) {
    throw new Error(
      "Missing recipient town ID for RedSpeed pickup request. Select a delivery town in checkout before payment.",
    );
  }

  if (!senderTownId) {
    throw new Error(
      "Missing REDSPEED_SENDER_TOWN_ID. Set a valid sender town ID in the server environment.",
    );
  }

  if (!senderCity) {
    throw new Error(
      `Invalid RedSpeed sender city '${REDSPEED_SENDER_CITY}'. Use a valid RedSpeed city name/code such as LAGOS MAINLAND or MLD.`,
    );
  }

  if (!resolvedRecipientCity) {
    throw new Error(
      `Invalid RedSpeed recipient city '${recipientCity}'. The order metadata must contain a valid RedSpeed city code.`,
    );
  }

  const payload = {
    senderCity,
    recipientCity: resolvedRecipientCity,
    recipientTownID: recipientTownId,
    recipientName: typedOrder.delivery_full_name,
    recipientPhoneNo: typedOrder.delivery_phone,
    recipientEmail: typedOrder.delivery_email,
    recipientAddress: typedOrder.delivery_address,
    recipientState: typedOrder.delivery_state,
    senderTownID: senderTownId,
    senderName: REDSPEED_SENDER_NAME,
    senderAddress: REDSPEED_SENDER_ADDRESS,
    senderPhone: REDSPEED_SENDER_PHONE,
    orderNo: typedOrder.id,
    packaging: "Standard",
    deliveryType: "Door Delivery",
    description: `${typedOrder.item_name} (${typedOrder.collection_name})`,
    paymentType: REDSPEED_DEFAULT_PAYMENT_TYPE,
    pickupType: Number.isFinite(REDSPEED_PICKUP_TYPE) ? REDSPEED_PICKUP_TYPE : 1,
    weight: shipmentWeight,
    pieces,
    cashOnDelivery: 0,
    shipmentItems: [
      {
        commodity: typedOrder.item_name,
        description: typedOrder.collection_name,
        quantity: pieces,
        weight: shipmentWeight,
        unitOfPrice: Number(typedOrder.unit_price),
      },
    ],
  };

  let responsePayload: unknown;
  try {
    responsePayload = await requestRedspeed("/api/Operations/PickupRequest", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const providerError = error instanceof RedspeedRequestError ? error : null;
    const failureMessage =
      providerError?.providerPayload && typeof providerError.providerPayload === "object"
        ? JSON.stringify(providerError.providerPayload)
        : error instanceof Error
          ? error.message
          : "Failed to create RedSpeed pickup request";

    const pickupFailurePayload = {
      error: failureMessage,
      providerStatus: providerError?.providerStatus,
      providerResponse: providerError?.providerPayload,
      request: payload,
    };

    const { error: failureUpdateError } = await supabaseServer
      .from("orders")
      .update({
        status: "paid",
        redspeed_waybill_number: null,
        redspeed_tracking_status: `Pickup request failed: ${failureMessage}`,
        redspeed_last_tracking_at: new Date().toISOString(),
        redspeed_shipment_payload: pickupFailurePayload,
      })
      .eq("id", orderId);

    if (failureUpdateError) {
      throw new Error(`Failed to persist RedSpeed pickup failure: ${failureUpdateError.message}`);
    }

    return {
      waybillNumber: null,
      alreadyExists: false,
      pickupStatus: "failed" as const,
      providerResponse: pickupFailurePayload,
    };
  }

  const waybillNumber = extractWaybillNumber(responsePayload) || null;

  const { error: updateError } = await supabaseServer
    .from("orders")
    .update({
      status: "processing",
      redspeed_waybill_number: waybillNumber,
      redspeed_tracking_status: "Pickup requested",
      redspeed_last_tracking_at: new Date().toISOString(),
      redspeed_shipment_payload: responsePayload,
    })
    .eq("id", orderId);

  if (updateError) {
    throw new Error(`Failed to persist RedSpeed shipment details: ${updateError.message}`);
  }

  return {
    waybillNumber,
    alreadyExists: false,
    providerResponse: responsePayload,
  };
};

export const handleGetRedspeedCities: RequestHandler = async (_req, res) => {
  try {
    const payload = await requestRedspeed("/api/Operations/Cities");
    const cities = Array.isArray(payload)
      ? (payload as RedspeedCity[]).filter((city) => {
          const abbr = typeof city.abbr === "string" ? city.abbr.trim() : "";
          const name = typeof city.name === "string" ? city.name.trim() : "";
          return Boolean(abbr || name);
        })
      : [];
    return res.status(200).json({ cities });
  } catch (error) {
    const mapped = mapRedspeedError(error, "Failed to load cities");
    return res.status(mapped.status).json(mapped.body);
  }
};

export const handleGetRedspeedDeliveryTowns: RequestHandler = async (req, res) => {
  const codeParam = req.params.code;
  const code = typeof codeParam === "string" ? codeParam.trim() : "";
  if (!code) {
    return res.status(400).json({ error: "City code is required" });
  }

  try {
    const payload = await requestRedspeed(`/api/Operations/DeliveryTowns/${encodeURIComponent(code)}`);
    return res.status(200).json({ towns: Array.isArray(payload) ? (payload as RedspeedTown[]) : [] });
  } catch (error) {
    const mapped = mapRedspeedError(error, "Failed to load delivery towns");
    return res.status(mapped.status).json(mapped.body);
  }
};

export const handleGetRedspeedPickupTypes: RequestHandler = async (_req, res) => {
  try {
    const payload = await requestRedspeed("/api/Operations/PickupTypes");
    return res.status(200).json({ pickupTypes: payload });
  } catch (error) {
    const mapped = mapRedspeedError(error, "Failed to load pickup types");
    return res.status(mapped.status).json(mapped.body);
  }
};

export const handleGetRedspeedDeliveryFee: RequestHandler = async (req, res) => {
  const body = req.body as DeliveryFeeRequest | undefined;
  const senderCityInput = typeof body?.senderCity === "string" ? body.senderCity.trim() : REDSPEED_SENDER_CITY;
  const recipientCityInput = typeof body?.recipientCity === "string" ? body.recipientCity.trim() : "";
  const recipientTownID = normalizeTownId(body?.recipientTownID);
  const senderTownID = normalizeTownId(body?.senderTownID) ?? normalizeTownId(REDSPEED_SENDER_TOWN_ID);
  const pickupType = Number.isFinite(Number(body?.pickupType)) ? Number(body?.pickupType) : REDSPEED_PICKUP_TYPE;
  const weight = Number.isFinite(Number(body?.weight)) && Number(body?.weight) > 0
    ? Number(body?.weight)
    : REDSPEED_DEFAULT_WEIGHT;

  if (!senderCityInput || !recipientCityInput) {
    return res.status(400).json({ error: "senderCity and recipientCity are required" });
  }

  if (!senderTownID || !recipientTownID) {
    return res.status(400).json({
      error:
        "senderTownID and recipientTownID are required. Select a delivery town and configure REDSPEED_SENDER_TOWN_ID.",
    });
  }

  try {
    const [senderCityIdentity, recipientCityIdentity] = await Promise.all([
      resolveRedspeedCityIdentity(senderCityInput),
      resolveRedspeedCityIdentity(recipientCityInput),
    ]);
    const senderCity = senderCityIdentity?.name || "";
    const recipientCity = recipientCityIdentity?.name || "";

    console.log(`[RedSpeed DeliveryFee] Input - senderCity: '${senderCityInput}', recipientCity: '${recipientCityInput}'`);
    console.log(`[RedSpeed DeliveryFee] Resolved - senderCity: '${senderCity}', recipientCity: '${recipientCity}'`);

    if (!senderCity) {
      return res.status(400).json({
        error: `Invalid sender city '${senderCityInput}'. Set REDSPEED_SENDER_CITY to a valid RedSpeed city code/name.`,
      });
    }

    if (!recipientCity) {
      return res.status(400).json({
        error: `Invalid recipient city '${recipientCityInput}'. Select a valid RedSpeed city from the checkout dropdown.`,
      });
    }

    console.log(`[RedSpeed DeliveryFee] Sending to API: senderCity='${senderCity}', recipientCity='${recipientCity}', weight=${weight}, pickupType=${pickupType}`);

    const payload = await requestRedspeed("/api/Operations/DeliveryFee", {
      method: "POST",
      body: JSON.stringify({
        senderCity,
        recipientCity,
        recipientTownID,
        senderTownID,
        pickupType,
        weight,
      }),
    });

    const deliveryFeeNgn = resolveDeliveryFee(payload);
    console.log(`[RedSpeed DeliveryFee] Response - fee (NGN): ${deliveryFeeNgn}`);
    
    if (deliveryFeeNgn === null) {
      console.error(`[RedSpeed DeliveryFee] ERROR - No fee in payload:`, payload);
      return res.status(502).json({ error: "RedSpeed did not return a delivery fee", providerResponse: payload });
    }

    const converted = convertNgnToUsd(deliveryFeeNgn);
    console.log(`[RedSpeed DeliveryFee] Converted - fee (USD): ${converted.deliveryFeeUsd}`);

    return res.status(200).json({
      deliveryFee: converted.deliveryFeeUsd,
      deliveryFeeNgn,
      fxRateNgnPerUsd: converted.fxRateNgnPerUsd,
      fxBufferPercent: converted.fxBufferPercent,
      providerResponse: payload,
    });
  } catch (error) {
    const mapped = mapRedspeedError(error, "Failed to calculate delivery fee");
    return res.status(mapped.status).json(mapped.body);
  }
};

export const handleTrackRedspeedShipment: RequestHandler = async (req, res) => {
  const waybillNumber = typeof req.query.waybillNumber === "string" ? req.query.waybillNumber.trim() : "";
  if (!waybillNumber) {
    return res.status(400).json({ error: "waybillNumber is required" });
  }

  try {
    const { shipments } = await syncRedspeedShipmentByWaybill(waybillNumber);

    return res.status(200).json({ shipments });
  } catch (error) {
    const mapped = mapRedspeedError(error, "Failed to track shipment");
    return res.status(mapped.status).json(mapped.body);
  }
};
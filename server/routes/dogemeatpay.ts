import { createHmac, timingSafeEqual } from "crypto";
import type { Request, RequestHandler } from "express";
import { supabaseServer } from "../supabase";
import { createRedspeedShipmentForOrder } from "./redspeed";

const DOGEMEATPAY_API_BASE_URL = (process.env.DOGEMEATPAY_API_BASE_URL || "https://api.dogemeatpay.info/v1").replace(/\/$/, "");
const DOGEMEATPAY_API_KEY = (
  process.env.DOGEMEATPAY_API_KEY ||
  ""
).trim();
const DOGEMEATPAY_WEBHOOK_SECRET = (
  process.env.DOGEMEATPAY_WEBHOOK_SECRET ||
  ""
).trim();
const DOGEMEATPAY_PAYOUT_WALLET = (
  process.env.DOGEMEATPAY_PAYOUT_WALLET || process.env.ADMIN_WALLET_ADDRESS || ""
).trim();
const PUBLIC_APP_URL = (process.env.PUBLIC_APP_URL || "").trim().replace(/\/$/, "");

type CreateSessionRequest = {
  amount?: number;
  currency?: string;
  productName?: string;
  redirectUrl?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
};

type RawBodyRequest = Request & {
  rawBody?: Buffer;
};

export type DogemeatSessionRecord = {
  status?: string;
  paymentStatus?: string;
  checkoutStatus?: string;
  sessionStatus?: string;
  event?: string;
  type?: string;
  eventName?: string;
  metadata?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

type DogemeatWebhookHeaders = {
  event?: string;
  delivery?: string;
  testMode?: string;
};

type DogemeatWebhookBody = {
  sessionId?: string;
  data?: {
    sessionId?: string;
    metadata?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
};

const getWebhookEventName = (body: unknown) => {
  if (!body || typeof body !== "object") {
    return "";
  }

  const record = body as Record<string, unknown>;
  const candidates = [record.event, record.type, record.eventName, record.status];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim().toLowerCase();
    }
  }

  return "";
};

const getWebhookHeaderValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
};

const getWebhookHeaders = (request: Request): DogemeatWebhookHeaders => ({
  event: getWebhookHeaderValue(request.headers["x-dogemeat-event"] as string | string[] | undefined),
  delivery: getWebhookHeaderValue(request.headers["x-dogemeat-delivery"] as string | string[] | undefined),
  testMode: getWebhookHeaderValue(request.headers["x-dogemeat-test-mode"] as string | string[] | undefined),
});

const getWebhookSessionId = (body: unknown) => {
  if (!body || typeof body !== "object") {
    return "";
  }

  const record = body as DogemeatWebhookBody;
  const sessionId = record.sessionId || record.data?.sessionId;

  return typeof sessionId === "string" ? sessionId.trim() : "";
};

const getWebhookMetadata = (body: unknown) => {
  if (!body || typeof body !== "object") {
    return undefined;
  }

  const record = body as DogemeatWebhookBody;

  if (record.metadata && typeof record.metadata === "object") {
    return record.metadata;
  }

  if (record.data?.metadata && typeof record.data.metadata === "object") {
    return record.data.metadata;
  }

  return undefined;
};

export const isSuccessfulDogemeatPayment = (body: unknown) => {
  if (!body || typeof body !== "object") {
    return false;
  }

  const record = body as Record<string, unknown>;
  const eventName = getWebhookEventName(body);
  const statusCandidates = [record.paymentStatus, record.checkoutStatus, record.sessionStatus];

  const status = statusCandidates.find((value) => typeof value === "string" && value.trim());
  const normalizedStatus = typeof status === "string" ? status.trim().toLowerCase() : "";

  return (
    eventName === "payment.success" ||
    eventName === "payment.succeeded" ||
    eventName === "checkout.completed" ||
    eventName === "session.paid" ||
    normalizedStatus === "paid" ||
    normalizedStatus === "success" ||
    normalizedStatus === "completed"
  );
};

const getRequestOrigin = (request: Request) => {
  const originHeader = request.headers.origin;
  if (typeof originHeader === "string" && originHeader.trim()) {
    return originHeader.trim().replace(/\/$/, "");
  }

  const host = request.get("host");
  const protocol = request.protocol || "http";
  return host ? `${protocol}://${host}` : "http://localhost:8080";
};

const parseJsonError = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return response.statusText || "Request failed";
  }

  try {
    const payload = JSON.parse(text) as { error?: string; message?: string };
    return payload.error || payload.message || text;
  } catch {
    return text;
  }
};

const parseJsonResponse = async (response: Response) => {
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

export const fetchDogemeatSession = async (sessionId: string) => {
  const normalizedSessionId = sessionId.trim();
  if (!normalizedSessionId) {
    throw new Error("sessionId is required");
  }

  if (!DOGEMEATPAY_API_KEY) {
    throw new Error("Missing Dogemeat Pay live API key");
  }

  const response = await fetch(`${DOGEMEATPAY_API_BASE_URL}/gateway/sessions/${encodeURIComponent(normalizedSessionId)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${DOGEMEATPAY_API_KEY}`,
      Accept: "application/json",
    },
  });

  const payload = await parseJsonResponse(response);
  if (!response.ok) {
    const errorMessage =
      typeof payload === "string"
        ? payload
        : JSON.stringify(payload || { message: response.statusText });
    throw new Error(`Dogemeat session lookup failed (${response.status}): ${errorMessage}`);
  }

  return payload as DogemeatSessionRecord;
};

const buildFallbackRedirectUrl = (origin: string, orderId?: string) => {
  const normalizedOrderId = typeof orderId === "string" ? orderId.trim() : "";
  return normalizedOrderId
    ? `${origin}/payment/return?payment=success&orderId=${encodeURIComponent(normalizedOrderId)}`
    : `${origin}/payment/return?payment=success`;
};

const resolveRedirectUrl = (origin: string, redirectUrl?: string, orderId?: string) => {
  if (!redirectUrl) {
    return buildFallbackRedirectUrl(origin, orderId);
  }

  try {
    const parsedUrl = new URL(redirectUrl);
    return parsedUrl.origin === origin ? parsedUrl.toString() : buildFallbackRedirectUrl(origin, orderId);
  } catch {
    return buildFallbackRedirectUrl(origin, orderId);
  }
};

const resolvePublicAppUrl = (origin: string) => {
  if (PUBLIC_APP_URL) {
    return PUBLIC_APP_URL;
  }

  return origin;
};

export const handleCreateDogemeatSession: RequestHandler = async (req, res) => {
  if (!DOGEMEATPAY_API_KEY) {
    return res.status(500).json({ error: "Missing Dogemeat Pay live API key. Set DOGEMEATPAY_API_KEY in the running server environment, not only in .env." });
  }

  if (!DOGEMEATPAY_PAYOUT_WALLET) {
    return res.status(500).json({ error: "Missing Dogemeat Pay payout wallet" });
  }

  const body = req.body as CreateSessionRequest | undefined;
  const amount = Number(body?.amount);
  const currency = typeof body?.currency === "string" && body.currency.trim() ? body.currency.trim() : "USD";
  const productName = typeof body?.productName === "string" ? body.productName.trim() : "";
  const metadata = body?.metadata && typeof body.metadata === "object" ? body.metadata : {};
  const idempotencyKey = typeof body?.idempotencyKey === "string" ? body.idempotencyKey.trim() : "";

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: "amount must be greater than zero" });
  }

  if (!productName) {
    return res.status(400).json({ error: "productName is required" });
  }

  if (!idempotencyKey) {
    return res.status(400).json({ error: "idempotencyKey is required" });
  }

  const origin = getRequestOrigin(req);
  const publicAppUrl = resolvePublicAppUrl(origin);
  const orderId = typeof metadata.orderId === "string" ? metadata.orderId : undefined;
  const redirectUrl = resolveRedirectUrl(publicAppUrl, body?.redirectUrl, orderId);
  const webhookUrl = new URL("/api/webhooks/dogemeatpay", publicAppUrl).toString();

  const response = await fetch(`${DOGEMEATPAY_API_BASE_URL}/gateway/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DOGEMEATPAY_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      amount: Number(amount.toFixed(2)),
      currency,
      productName,
      payoutWallet: DOGEMEATPAY_PAYOUT_WALLET,
      webhookUrl,
      redirectUrl,
      metadata,
    }),
  });

  if (!response.ok) {
    const errorMessage = await parseJsonError(response);

    if (response.status === 401 || /no api found|invalid api key|unauthorized/i.test(errorMessage)) {
      return res.status(401).json({
        error: `Dogemeat Pay rejected the API key. Verify the live merchant API key from the dashboard is loaded in the running server environment and that you are using the merchant API key for the Sessions endpoint. Original error: ${errorMessage}`,
      });
    }

    return res.status(response.status).json({ error: errorMessage });
  }

  const payload = (await response.json()) as {
    message?: string;
    sessionId?: string;
    checkoutUrl?: string;
    data?: {
      sessionId?: string;
      checkoutUrl?: string;
    };
  };

  const sessionId = payload.sessionId || payload.data?.sessionId;
  const checkoutUrl = payload.checkoutUrl || payload.data?.checkoutUrl;

  if (!checkoutUrl) {
    return res.status(502).json({
      error: payload.message || "Dogemeat Pay did not return a checkoutUrl",
      providerResponse: payload,
    });
  }

  return res.status(201).json({
    sessionId,
    checkoutUrl,
  });
};

export const handleDogemeatWebhook: RequestHandler = async (req, res) => {
  if (!DOGEMEATPAY_WEBHOOK_SECRET) {
    return res.status(500).json({ error: "Missing Dogemeat Pay webhook secret" });
  }

  const rawRequest = req as RawBodyRequest;
  const signature = req.headers["x-dogemeat-signature"];
  if (typeof signature !== "string" || !signature.trim()) {
    return res.status(401).send("Missing signature");
  }

  const receivedSignature = signature.trim();
  if (!/^[a-f0-9]+$/i.test(receivedSignature)) {
    return res.status(401).send("Invalid signature");
  }

  const payload = rawRequest.rawBody ? rawRequest.rawBody : Buffer.from(JSON.stringify(req.body ?? {}));
  const expectedSignature = createHmac("sha256", DOGEMEATPAY_WEBHOOK_SECRET).update(payload).digest("hex");

  if (expectedSignature.length !== receivedSignature.length) {
    return res.status(401).send("Invalid signature");
  }

  const signaturesMatch = timingSafeEqual(
    Buffer.from(expectedSignature, "hex"),
    Buffer.from(receivedSignature, "hex"),
  );

  if (!signaturesMatch) {
    return res.status(401).send("Invalid signature");
  }

  const headers = getWebhookHeaders(req);
  const event = headers.event || getWebhookEventName(req.body);
  const webhookMetadata = getWebhookMetadata(req.body);
  let orderId = typeof webhookMetadata?.orderId === "string" ? webhookMetadata.orderId.trim() : "";

  if (!orderId) {
    const sessionId = getWebhookSessionId(req.body);

    if (sessionId) {
      try {
        const session = await fetchDogemeatSession(sessionId);
        const sessionMetadata = session.metadata;
        const resolvedOrderId = typeof sessionMetadata?.orderId === "string" ? sessionMetadata.orderId.trim() : "";

        if (resolvedOrderId) {
          orderId = resolvedOrderId;
        }
      } catch (error) {
        console.warn("Dogemeat webhook could not resolve orderId from session lookup", {
          sessionId,
          error: error instanceof Error ? error.message : error,
        });
      }
    }
  }

  if (event === "payment.success" || isSuccessfulDogemeatPayment(req.body)) {
    if (!orderId) {
      console.warn("Dogemeat webhook received a success event without metadata.orderId", {
        sessionId: getWebhookSessionId(req.body) || undefined,
        event,
        delivery: headers.delivery || undefined,
        testMode: headers.testMode || undefined,
      });
      return res.status(200).send("ok");
    }

    const { error } = await supabaseServer.from("orders").update({ status: "paid" }).eq("id", orderId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    try {
      await createRedspeedShipmentForOrder(orderId, req.body?.metadata);
    } catch (shipmentError) {
      console.error("Failed to create RedSpeed shipment", {
        orderId,
        error: shipmentError instanceof Error ? shipmentError.message : shipmentError,
      });
    }
  }

  return res.status(200).send("ok");
};
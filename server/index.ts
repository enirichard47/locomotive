import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleGenerateMockup } from "./routes/generate-mockup";
import { handleCreateSupportTicket } from "./routes/support-ticket";
import { handleHealthCheck } from "./routes/health-check";
import {
  handleCreateCollection,
  handleDeleteCollection,
  handleGetCollectionBySlug,
  handleGetCollections,
  handleUpdateCollection,
} from "./routes/collections";
import {
  handleCreateOrder,
  handleClearAllOrders,
  handleGetOrders,
  handleConfirmPaidOrder,
  handleUpdateOrderStatus,
  handleAdminResendRedspeedPickup,
} from "./routes/orders";
import {
  handleCreateDogemeatSession,
  handleDogemeatWebhook,
} from "./routes/dogemeatpay";
import { handleAdminFileUpload } from "./routes/uploads";
import {
  handleGetRedspeedCities,
  handleGetRedspeedDeliveryFee,
  handleGetRedspeedDeliveryTowns,
  handleGetRedspeedPickupTypes,
  handleTrackRedspeedShipment,
} from "./routes/redspeed";
import {
  handleAuthChallenge,
  handleAuthLogout,
  handleAuthSession,
  handleAuthVerify,
  requireAdminSession,
  requireAuthenticatedSession,
} from "./routes/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors({ origin: true, credentials: true }));
  app.use(
    express.json({
      limit: "100mb",
      verify: (req, _res, buffer) => {
        (req as express.Request & { rawBody?: Buffer }).rawBody = Buffer.from(buffer);
      },
    }),
  );
  app.use(express.urlencoded({ extended: true, limit: "100mb" }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/health", handleHealthCheck);
  app.get("/api/demo", handleDemo);
  app.post("/api/auth/challenge", handleAuthChallenge);
  app.post("/api/auth/verify", handleAuthVerify);
  app.get("/api/auth/session", handleAuthSession);
  app.post("/api/auth/logout", handleAuthLogout);

  app.get("/api/collections", handleGetCollections);
  app.get("/api/collections/:slug", handleGetCollectionBySlug);
  app.post("/api/admin/collections", requireAdminSession, handleCreateCollection);
  app.put("/api/admin/collections/:id", requireAdminSession, handleUpdateCollection);
  app.delete("/api/admin/collections/:id", requireAdminSession, handleDeleteCollection);

  app.get("/api/orders", requireAuthenticatedSession, handleGetOrders);
  app.post("/api/orders", requireAuthenticatedSession, handleCreateOrder);
  app.post("/api/orders/:id/confirm-paid", requireAuthenticatedSession, handleConfirmPaidOrder);
  app.patch("/api/orders/:id/status", requireAdminSession, handleUpdateOrderStatus);
  app.delete("/api/admin/orders", requireAdminSession, handleClearAllOrders);
  app.post(
    "/api/admin/orders/:id/resend-redspeed-pickup",
    requireAdminSession,
    handleAdminResendRedspeedPickup,
  );

  // Admin upload endpoint - expects multipart/form-data with `file` field
  app.post("/api/admin/uploads", requireAdminSession, handleAdminFileUpload);

  app.post("/api/payments/dogemeatpay/session", requireAuthenticatedSession, handleCreateDogemeatSession);
  app.post("/api/webhooks/dogemeatpay", handleDogemeatWebhook);

  app.get("/api/delivery/redspeed/cities", requireAuthenticatedSession, handleGetRedspeedCities);
  app.post("/api/delivery/redspeed/fee", requireAuthenticatedSession, handleGetRedspeedDeliveryFee);
  app.get("/api/delivery/redspeed/towns/:code", requireAuthenticatedSession, handleGetRedspeedDeliveryTowns);
  app.get("/api/delivery/redspeed/pickup-types", requireAuthenticatedSession, handleGetRedspeedPickupTypes);
  app.get("/api/delivery/redspeed/track", requireAuthenticatedSession, handleTrackRedspeedShipment);

  app.post("/api/generate-mockup", handleGenerateMockup);
  app.post("/api/support-ticket", handleCreateSupportTicket);

  // Global error handler for oversized payloads and friendly messages
  // This should run after all routes so body-parser errors are caught here.
  // Express error handler signature: (err, req, res, next)
  // Detect raw-body / body-parser oversize errors which commonly set `type === 'entity.too.large'`.
  // Respond with a clear message and avoid leaking internals.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    try {
      if (err && (err.type === "entity.too.large" || err.status === 413 || /request entity too large/i.test(String(err.message || "")))) {
        console.warn("Payload too large error caught by server middleware", {
          message: err.message || String(err),
        });
        return res.status(413).json({
          error:
            "Request entity too large. Reduce payload size (avoid sending large base64 blobs). Upload images separately and send a URL, or reduce data sent in the request.",
        });
      }
    } catch (e) {
      // fallthrough to default handler below
      console.warn("Error while handling oversized payload error", { error: e instanceof Error ? e.message : e });
    }

    // Default generic error response for other errors
    if (err) {
      console.error("Unhandled server error", { error: err instanceof Error ? err.message : err });
      return res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }

    return res;
  });

  return app;
}

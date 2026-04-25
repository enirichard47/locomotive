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
} from "./routes/orders";
import {
  handleCreateDogemeatSession,
  handleDogemeatWebhook,
} from "./routes/dogemeatpay";
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
      limit: "25mb",
      verify: (req, _res, buffer) => {
        (req as express.Request & { rawBody?: Buffer }).rawBody = Buffer.from(buffer);
      },
    }),
  );
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

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

  app.post("/api/payments/dogemeatpay/session", requireAuthenticatedSession, handleCreateDogemeatSession);
  app.post("/api/webhooks/dogemeatpay", handleDogemeatWebhook);

  app.get("/api/delivery/redspeed/cities", requireAuthenticatedSession, handleGetRedspeedCities);
  app.post("/api/delivery/redspeed/fee", requireAuthenticatedSession, handleGetRedspeedDeliveryFee);
  app.get("/api/delivery/redspeed/towns/:code", requireAuthenticatedSession, handleGetRedspeedDeliveryTowns);
  app.get("/api/delivery/redspeed/pickup-types", requireAuthenticatedSession, handleGetRedspeedPickupTypes);
  app.get("/api/delivery/redspeed/track", requireAuthenticatedSession, handleTrackRedspeedShipment);

  app.post("/api/generate-mockup", handleGenerateMockup);
  app.post("/api/support-ticket", handleCreateSupportTicket);

  return app;
}

import path from "path";
import { createServer } from "./index";
import express from "express";

const app = createServer();
const port = process.env.PORT || 3000;

// Resolve __dirname in ESM
const __dirname = import.meta.dirname;

// In production, serve the built SPA files
const distPath = path.join(__dirname, "../spa");

// Serve static files
app.use(express.static(distPath));

/**
 * SPA fallback:
 * Match everything EXCEPT routes that start with /api/ or /health
 * Using RegExp avoids path-to-regexp wildcard parsing issues.
 */
app.get(/^\/(?!api\/|health).*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Optional: explicit 404 for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});

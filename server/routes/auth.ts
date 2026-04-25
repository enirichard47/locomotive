import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { Request, RequestHandler } from "express";
import bs58 from "bs58";
import nacl from "tweetnacl";

const AUTH_COOKIE_NAME = "locomotive_auth";
const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const ADMIN_WALLET_ADDRESS =
  (process.env.ADMIN_WALLET_ADDRESS || "4LFaS625N8PjCC1zTyYEdrfvVrEHWTGuhe1dWxRhPcau").trim();
const AUTH_SESSION_SECRET = process.env.AUTH_SESSION_SECRET || "dev-insecure-auth-secret";

type PendingChallenge = {
  walletAddress: string;
  expiresAt: number;
};

type SessionPayload = {
  walletAddress: string;
  isAdmin: boolean;
  expiresAt: number;
};

const pendingChallenges = new Map<string, PendingChallenge>();

const sanitizeWalletAddress = (value?: string | null) =>
  (value ?? "").replace(/\s+/g, "").trim();

const cleanupExpiredChallenges = () => {
  const now = Date.now();
  for (const [nonce, challenge] of pendingChallenges.entries()) {
    if (challenge.expiresAt <= now) {
      pendingChallenges.delete(nonce);
    }
  }
};

const toBase64Url = (value: Buffer | string) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const fromBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return Buffer.from(padded, "base64");
};

const parseCookies = (request: Request) => {
  const header = request.headers.cookie || "";
  const cookies = new Map<string, string>();

  header.split(";").forEach((part) => {
    const [rawName, ...rest] = part.trim().split("=");
    if (!rawName || rest.length === 0) {
      return;
    }

    cookies.set(rawName, decodeURIComponent(rest.join("=")));
  });

  return cookies;
};

const createSessionToken = (payload: SessionPayload) => {
  const payloadValue = toBase64Url(JSON.stringify(payload));
  const signature = createHmac("sha256", AUTH_SESSION_SECRET).update(payloadValue).digest();
  return `${payloadValue}.${toBase64Url(signature)}`;
};

const verifySessionToken = (token: string): SessionPayload | null => {
  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [payloadValue, signatureValue] = parts;

  const expectedSignature = createHmac("sha256", AUTH_SESSION_SECRET).update(payloadValue).digest();
  const receivedSignature = fromBase64Url(signatureValue);

  if (expectedSignature.length !== receivedSignature.length) {
    return null;
  }

  if (!timingSafeEqual(expectedSignature, receivedSignature)) {
    return null;
  }

  const payload = JSON.parse(fromBase64Url(payloadValue).toString("utf8")) as SessionPayload;

  if (!payload.walletAddress || payload.expiresAt <= Date.now()) {
    return null;
  }

  return payload;
};

const createChallengeMessage = (walletAddress: string, nonce: string) =>
  [
    "Locomotive Wallet Authentication",
    `Wallet: ${walletAddress}`,
    `Nonce: ${nonce}`,
    "Sign this message to authenticate.",
  ].join("\n");

const getSessionFromRequest = (request: Request): SessionPayload | null => {
  const token = parseCookies(request).get(AUTH_COOKIE_NAME);
  if (!token) {
    return null;
  }

  return verifySessionToken(token);
};

export const requireAuthenticatedSession: RequestHandler = (req, res, next) => {
  const session = getSessionFromRequest(req);

  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }

  res.locals.auth = session;
  next();
};

export const requireAdminSession: RequestHandler = (req, res, next) => {
  const session = getSessionFromRequest(req);

  if (!session) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!session.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }

  res.locals.auth = session;
  next();
};

export const handleAuthChallenge: RequestHandler = (req, res) => {
  cleanupExpiredChallenges();

  const walletAddress = sanitizeWalletAddress(req.body?.walletAddress);

  if (!walletAddress) {
    return res.status(400).json({ error: "walletAddress is required" });
  }

  const nonce = randomBytes(16).toString("hex");
  pendingChallenges.set(nonce, {
    walletAddress,
    expiresAt: Date.now() + CHALLENGE_TTL_MS,
  });

  const message = createChallengeMessage(walletAddress, nonce);

  return res.status(200).json({ nonce, message, expiresInMs: CHALLENGE_TTL_MS });
};

export const handleAuthVerify: RequestHandler = (req, res) => {
  cleanupExpiredChallenges();

  const walletAddress = sanitizeWalletAddress(req.body?.walletAddress);
  const nonce = typeof req.body?.nonce === "string" ? req.body.nonce.trim() : "";
  const signatureBase64 = typeof req.body?.signature === "string" ? req.body.signature.trim() : "";

  if (!walletAddress || !nonce || !signatureBase64) {
    return res.status(400).json({ error: "walletAddress, nonce, and signature are required" });
  }

  const challenge = pendingChallenges.get(nonce);

  if (!challenge || challenge.expiresAt <= Date.now()) {
    pendingChallenges.delete(nonce);
    return res.status(401).json({ error: "Challenge expired or invalid" });
  }

  if (challenge.walletAddress !== walletAddress) {
    pendingChallenges.delete(nonce);
    return res.status(401).json({ error: "Challenge does not match wallet" });
  }

  const message = createChallengeMessage(walletAddress, nonce);
  const messageBytes = new TextEncoder().encode(message);

  let signature: Uint8Array;
  let publicKey: Uint8Array;
  try {
    signature = new Uint8Array(Buffer.from(signatureBase64, "base64"));
    publicKey = bs58.decode(walletAddress);
  } catch {
    pendingChallenges.delete(nonce);
    return res.status(400).json({ error: "Invalid signature payload" });
  }

  const isValidSignature = nacl.sign.detached.verify(messageBytes, signature, publicKey);

  if (!isValidSignature) {
    pendingChallenges.delete(nonce);
    return res.status(401).json({ error: "Invalid wallet signature" });
  }

  pendingChallenges.delete(nonce);

  const isAdmin = walletAddress.toLowerCase() === ADMIN_WALLET_ADDRESS.toLowerCase();
  const session: SessionPayload = {
    walletAddress,
    isAdmin,
    expiresAt: Date.now() + SESSION_TTL_MS,
  };

  res.cookie(AUTH_COOKIE_NAME, createSessionToken(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS,
  });

  return res.status(200).json({
    authenticated: true,
    walletAddress,
    isAdmin,
    expiresAt: session.expiresAt,
  });
};

export const handleAuthSession: RequestHandler = (req, res) => {
  const session = getSessionFromRequest(req);

  if (!session) {
    return res.status(200).json({
      authenticated: false,
      walletAddress: null,
      isAdmin: false,
    });
  }

  return res.status(200).json({
    authenticated: true,
    walletAddress: session.walletAddress,
    isAdmin: session.isAdmin,
    expiresAt: session.expiresAt,
  });
};

export const handleAuthLogout: RequestHandler = (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res.status(200).json({ success: true });
};

/**
 * ADVANCED RATE LIMITER — COMPLETE SELF-CONTAINED MIDDLEWARE
 * ✔ Auto detect IP
 * ✔ Auto detect User-Agent
 * ✔ Sliding window
 * ✔ Burst allowance
 * ✔ Penalty-based slowdown
 * ✔ Retry-After message
 * ✔ Single function call usage
 */

import { NextRequest } from "next/server";

const WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // ⭐ allow 100 requests per minute
const BURST = 20; // ⭐ additional burst allowance
const PENALTY_MULTIPLIER = 1.4; // dynamic slowdown for spammers
const CLEANUP_INTERVAL = 120000; // 2 minutes

interface RateEntry {
  timestamps: number[];
  penalties: number;
  lastViolation: number;
}

const store = new Map<string, RateEntry>();

// -----------------------------
// CLEANUP ROUTINE
// -----------------------------
setInterval(() => {
  const now = Date.now();

  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter(
      (ts) => now - ts < WINDOW
    );

    if (
      entry.timestamps.length === 0 &&
      now - entry.lastViolation > 5 * WINDOW
    ) {
      store.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

// -----------------------------
// Get Real Client IP
// -----------------------------
function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.ip ||
    "unknown_ip"
  );
}

// -----------------------------
// Create Device Fingerprint
// -----------------------------
function getFingerprint(req: NextRequest): string {
  const ip = getClientIP(req);
  const ua = req.headers.get("user-agent") || "unknown_ua";
  return `${ip}_${ua}`;
}

// -----------------------------
// MAIN RATE LIMIT FUNCTION
// -----------------------------
export const rateLimit = (req: NextRequest) => {
  const key = getFingerprint(req);
  const now = Date.now();

  if (!store.has(key)) {
    store.set(key, {
      timestamps: [now],
      penalties: 0,
      lastViolation: 0,
    });
    return { allowed: true };
  }

  const entry = store.get(key)!;

  // Sliding window: keep recent only
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < WINDOW);

  // Dynamic limit with penalties
  const dynamicLimit =
    Math.max(20, MAX_REQUESTS / Math.pow(PENALTY_MULTIPLIER, entry.penalties)) +
    BURST;

  // Exceeded limit?
  if (entry.timestamps.length >= dynamicLimit) {
    entry.penalties++;
    entry.lastViolation = now;

    const retryAfter = WINDOW - (now - entry.timestamps[0]);

    return {
      allowed: false,
      retryAfter,
      penaltyLevel: entry.penalties,
      message: `Too many requests — try again in ${Math.ceil(
        retryAfter / 1000
      )} seconds.`,
    };
  }

  // Accept request
  entry.timestamps.push(now);
  return { allowed: true };
};

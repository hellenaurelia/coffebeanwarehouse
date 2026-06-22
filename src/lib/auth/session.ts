import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// IMPORTANT: cookie name matches the existing middleware (`arunika_session`)
// and the sidebar's client-side logout, so neither needs to change.
const SESSION_COOKIE = "arunika_session";
const MAX_AGE_SECONDS = 60 * 60 * 24; // 24h — matches the old demo cookie

// Signing secret. Set AUTH_SECRET in your env in production. The fallback keeps
// local dev working but is NOT secure — tokens would be forgeable.
const SECRET =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "arunika-dev-secret-change-me";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

// --- token format: base64url(payload).hexHmac -------------------------------
// payload = `${userId}.${expiresAtMs}`
function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function createSessionToken(userId: string): string {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${userId}.${exp}`;
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sign(payload)}`;
}

function verifySessionToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encoded, mac] = parts;

  let payload: string;
  try {
    payload = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const expected = sign(payload);
  // constant-time compare
  if (
    mac.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))
  ) {
    return null;
  }

  const [userId, expStr] = payload.split(".");
  const exp = Number(expStr);
  if (!userId || !Number.isFinite(exp) || Date.now() > exp) return null;
  return userId;
}

// --- public API -------------------------------------------------------------

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const userId = verifySessionToken(raw);
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  if (!user || !user.isActive) return null;
  return user;
}

// Replaces the old resolveActorId()/resolveCashierId() placeholders in the
// feature actions. Throws when there is no valid session.
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Tidak ada sesi aktif. Silakan login kembali.");
  return user;
}

export async function setSessionCookie(userId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

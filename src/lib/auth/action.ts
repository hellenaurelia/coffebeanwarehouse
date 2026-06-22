"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { setSessionCookie, clearSessionCookie } from "./session";

export type LoginResult = { ok: boolean; error?: string };

// Login identity is EMAIL (per data seed, e.g. arif@arunika.id). The login form
// label still reads "Username" — we don't change the UI; the value typed there
// is treated as an email.
export async function loginAction(
  email: string,
  password: string
): Promise<LoginResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { ok: false, error: "Email dan password wajib diisi." };
  }

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
    select: { id: true, passwordHash: true, isActive: true },
  });

  // Generic message — don't reveal which part failed.
  const invalid = { ok: false, error: "Email atau password salah." };
  if (!user) return invalid;
  if (!user.isActive) return { ok: false, error: "Akun nonaktif. Hubungi admin." };

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return invalid;

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await setSessionCookie(user.id);
  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
}

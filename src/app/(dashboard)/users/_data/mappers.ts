import type { Role, Status, Outlet, User } from "../_lib/types";
import type { Role as PrismaRole } from "@prisma/client";
import { initials } from "../_lib/constants";

const DB_TO_UI_ROLE: Record<string, Role> = {
  OWNER: "owner",
  MANAJER: "manajer",
  KASIR: "kasir",
  GUDANG: "gudang",
};

const UI_TO_DB_ROLE: Record<Role, PrismaRole> = {
  owner: "OWNER",
  manajer: "MANAJER",
  kasir: "KASIR",
  gudang: "GUDANG",
};

export function roleToUi(dbRole: string): Role {
  return DB_TO_UI_ROLE[dbRole] ?? "kasir";
}

export function roleToDb(uiRole: Role): PrismaRole {
  return UI_TO_DB_ROLE[uiRole] ?? "KASIR";
}

export function statusToUi(isActive: boolean): Status {
  return isActive ? "aktif" : "nonaktif";
}

export function statusToDbIsActive(status: Status): boolean {
  return status === "aktif";
}

export function outletToUi(dbOutlet: string | null): Outlet {
  return dbOutlet === "Senopati" ? "Senopati" : "Senopati";
}

const ID_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function wibParts(d: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")) - 1,
    day: Number(get("day")),
    hour: get("hour"),
    minute: get("minute"),
  };
}

export function formatLastLogin(d: Date | null): string {
  if (!d) return "Belum pernah masuk";

  const now = new Date();
  const dp = wibParts(d);
  const np = wibParts(now);

  const sameDay = dp.year === np.year && dp.month === np.month && dp.day === np.day;

  const yesterday = new Date(now.getTime() - 86_400_000);
  const yp = wibParts(yesterday);
  const isYesterday = dp.year === yp.year && dp.month === yp.month && dp.day === yp.day;

  const time = `${dp.hour}.${dp.minute}`;

  if (sameDay) return `Hari ini, ${time}`;
  if (isYesterday) return `Kemarin, ${time}`;
  return `${dp.day} ${ID_MONTHS[dp.month]} ${dp.year}, ${time}`;
}

export function deriveUsername(email: string, username: string | null): string {
  if (username && username.trim()) return username;
  return email.split("@")[0] ?? email;
}

export type DbUserRow = {
  id: string;
  name: string;
  username: string | null;
  email: string;
  role: string;
  outlet: string | null;
  isActive: boolean;
  lastLoginAt: Date | null;
};

export function mapUser(row: DbUserRow): User {
  return {
    id: row.id,
    name: row.name,
    username: deriveUsername(row.email, row.username),
    email: row.email,
    role: roleToUi(row.role),
    outlet: outletToUi(row.outlet),
    status: statusToUi(row.isActive),
    lastLogin: formatLastLogin(row.lastLoginAt),
    avatar: initials(row.name),
  };
}
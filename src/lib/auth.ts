import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export const SESSION_COOKIE = "admin_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createSession(): Promise<string> {
  const token = nanoid(64);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await prisma.adminSession.create({ data: { token, expiresAt } });
  return token;
}

export async function validateSessionToken(token: string): Promise<boolean> {
  const session = await prisma.adminSession.findUnique({ where: { token } });
  if (!session) return false;
  if (session.expiresAt < new Date()) {
    await prisma.adminSession.delete({ where: { token } });
    return false;
  }
  return true;
}

export async function deleteSession(token: string) {
  await prisma.adminSession.deleteMany({ where: { token } });
}

export async function getSessionFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = await getSessionFromCookies();
  if (!token) return false;
  return validateSessionToken(token);
}

export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  return password === adminPassword;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

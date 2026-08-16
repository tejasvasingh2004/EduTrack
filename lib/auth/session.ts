import { cookies } from "next/headers";
import { signAccessToken, signRefreshToken, verifyToken } from "./jwt";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function createSession(userId: string, role: string) {
  const accessToken = await signAccessToken({ userId, role });
  const refreshToken = await signRefreshToken({ userId, role });

  // Hash refresh token for DB storage
  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.refreshToken.create({
    data: {
      token: tokenHash,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60, // 15 mins
    path: "/",
  });

  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function clearSession() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (refreshToken) {
    const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await prisma.refreshToken.deleteMany({
      where: { token: tokenHash },
    });
  }

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
}

export async function refreshSession() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken) return null;

  const payload = await verifyToken(refreshToken);
  if (!payload) return null;

  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: tokenHash },
  });

  if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    if (tokenRecord) {
      await prisma.refreshToken.delete({ where: { token: tokenHash } });
    }
    return null;
  }

  // Delete old refresh token, create a new pair
  await prisma.refreshToken.delete({ where: { token: tokenHash } });
  await createSession(payload.userId, payload.role);

  return payload;
}

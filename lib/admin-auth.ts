import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "redflix_admin";
function signature(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("Falta configurar ADMIN_SESSION_SECRET.");
  return createHmac("sha256", secret).update(value).digest("hex");
}
export function createAdminToken() {
  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 12;
  const payload = String(expires);
  return payload + "." + signature(payload);
}
export function verifyAdminToken(token?: string) {
  if (!token) return false;
  const [expires, supplied] = token.split(".");
  if (!expires || !supplied || Number(expires) < Math.floor(Date.now()/1000)) return false;
  const expected = signature(expires);
  const a = Buffer.from(supplied), b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a,b);
}
export async function isAdminRequest() {
  const jar = await cookies();
  return verifyAdminToken(jar.get(COOKIE)?.value);
}
export const adminCookieName = COOKIE;

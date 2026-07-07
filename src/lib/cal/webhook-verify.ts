import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifies Cal.com's webhook signature (x-cal-signature-256 header):
 * HMAC-SHA256 of the raw request body with the webhook's signing secret.
 * Never trust a payload before this passes.
 */
export function verifyCalSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | undefined
): boolean {
  if (!secret || !signatureHeader) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = signatureHeader.trim().toLowerCase();

  if (expected.length !== received.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  } catch {
    return false;
  }
}

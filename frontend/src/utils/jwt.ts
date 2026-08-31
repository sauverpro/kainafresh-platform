/**
 * Lightweight JWT payload decoding (client-side, no signature verification).
 * The backend signs a HS256 token with payload: { user_id, username, email, ... }.
 * We only need to read `user_id` from the base64url-encoded middle segment.
 */

export interface JwtPayload {
  user_id?: number;
  username?: string;
  email?: string;
  exp?: number;
}

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return decodeURIComponent(
    Array.prototype.map
      .call(atob(padded), (c: string) => {
        const code = c.charCodeAt(0).toString(16);
        return "%" + (code.length === 1 ? "0" + code : code);
      })
      .join(""),
  );
}

/**
 * Decode the payload of a JWT string without verifying the signature.
 * Returns null for malformed tokens.
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

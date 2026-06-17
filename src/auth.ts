const encoder = new TextEncoder();

function b64UrlEncode(input: string): string {
	return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64UrlDecode(input: string): string {
	const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
	const padding = "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
	return atob(normalized + padding);
}

async function signValue(value: string, secret: string): Promise<string> {
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
	return b64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
}

function parseCookies(request: Request): Record<string, string> {
	const header = request.headers.get("Cookie") ?? "";
	return Object.fromEntries(
		header
			.split(";")
			.map((part) => part.trim())
			.filter(Boolean)
			.map((part) => {
				const [key, ...rest] = part.split("=");
				return [key, rest.join("=")];
			}),
	);
}

export async function createSessionCookie(secret: string): Promise<string> {
	const payload = b64UrlEncode(
		JSON.stringify({
			iat: Date.now(),
			exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
		}),
	);
	const signature = await signValue(payload, secret);
	return `${payload}.${signature}`;
}

export async function verifySession(request: Request, secret: string): Promise<boolean> {
	const token = parseCookies(request).npanel_session;
	if (!token) return false;
	const [payload, signature] = token.split(".");
	if (!payload || !signature) return false;
	const expected = await signValue(payload, secret);
	if (expected !== signature) return false;
	try {
		const parsed = JSON.parse(b64UrlDecode(payload)) as { exp?: number };
		return typeof parsed.exp === "number" && parsed.exp > Date.now();
	} catch {
		return false;
	}
}

export function makeSessionHeader(token: string, secure = false): string {
	return [
		`npanel_session=${token}`,
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		"Max-Age=604800",
		secure ? "Secure" : "",
	]
		.filter(Boolean)
		.join("; ");
}

export function clearSessionHeader(secure = false): string {
	return [
		"npanel_session=",
		"Path=/",
		"HttpOnly",
		"SameSite=Lax",
		"Max-Age=0",
		secure ? "Secure" : "",
	]
		.filter(Boolean)
		.join("; ");
}

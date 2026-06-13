// ─── Cron authentication — 3-method check ────────────────────
// Method 1: Vercel auto-sets Authorization: Bearer <CRON_SECRET>
// Method 2: Manual trigger via ?secret=<CRON_SECRET>
// Method 3: Legacy x-cron-secret header
export function verifyCronSecret(request) {
  const secret = process.env.CRON_SECRET;

  // No secret configured → DENY (fail-closed, never open in production)
  if (!secret) {
    console.error('verifyCronSecret: CRON_SECRET env var not set — denying request');
    return false;
  }

  // Method 1: Vercel Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${secret}`) return true;

  // Method 2: ?secret= query param (manual trigger)
  try {
    const url = new URL(request.url);
    if (url.searchParams.get('secret') === secret) return true;
  } catch {}

  // Method 3: x-cron-secret header (legacy)
  const cronHeader = request.headers.get('x-cron-secret');
  if (cronHeader === secret) return true;

  return false;
}

// ─── Generic API password check ──────────────────────────────
export function verifyApiPassword(request) {
  const password = process.env.SITE_API_PASSWORD;
  if (!password) return false;

  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${password}`) return true;

  try {
    const url = new URL(request.url);
    if (url.searchParams.get('password') === password) return true;
  } catch {}

  return false;
}

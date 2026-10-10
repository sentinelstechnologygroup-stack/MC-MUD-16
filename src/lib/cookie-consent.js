export const CONSENT_COOKIE = 'mcmud16_cookie_preferences';
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE = 180 * 24 * 60 * 60;

export function parseConsent(cookies, now = Date.now()) {
  try {
    const match = cookies.split(';').map(item => item.trim()).find(item => item.startsWith(CONSENT_COOKIE + '='));
    if (!match) return null;
    const saved = JSON.parse(decodeURIComponent(match.slice(CONSENT_COOKIE.length + 1)));
    if (saved.version !== CONSENT_VERSION || !['accepted', 'declined'].includes(saved.choice) || !Number.isFinite(saved.expiresAt) || saved.expiresAt <= now) return null;
    return saved.choice;
  } catch { return null; }
}

export function consentCookie(choice, secure, now = Date.now()) {
  if (!['accepted', 'declined'].includes(choice)) throw new Error('Invalid privacy choice');
  const value = encodeURIComponent(JSON.stringify({ version: CONSENT_VERSION, choice, expiresAt: now + CONSENT_MAX_AGE * 1000 }));
  return `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax${secure ? '; Secure' : ''}`;
}

export function isGoogleMapEmbed(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'www.google.com' && url.pathname === '/maps/embed' && url.searchParams.has('pb');
  } catch { return false; }
}

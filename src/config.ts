// ─────────────────────────────────────────────────────────────
// Central wedding configuration – edit details here only.
// ─────────────────────────────────────────────────────────────

export const WEDDING = {
  groomName: 'Sanjaya',
  brideName: 'Pavithra',
  groomParents: { mother: 'G. Yoheshwari', father: 'M. Arumugam' },
  brideParents: { mother: 'W.W.D. Malkanthi', father: 'W.D. Amarasiri' },

  // ISO date/time of the Poruwa ceremony (used by the countdown)
  ceremonyDateTime: '2026-12-06T09:47:00+05:30',
  dateLong: 'Sunday, December 06',
  dateFull: 'Sunday, 06 December 2026',
  dateShort: '06 . 12 . 2026',
  dateFooter: 'December 06, 2026',
  yearInWords: 'The Year Two Thousand Twenty Six',

  startTime: '09:30 AM',
  endTime: '03:30 PM',
  poruwaTime: '09:47 AM',

  venueName: 'Opulent River Face Hotel',
  venueCity: 'Rajagiriya',
  mapsLink: 'https://maps.app.goo.gl/ZM67P2EfEZdGxpE86',
  mapsEmbed:
    'https://maps.google.com/maps?q=Opulent+River+Face+Hotel+Rajagiriya&t=&z=15&ie=UTF8&iwloc=&output=embed',

  phones: ['0712597631', '0715898748'],
};

// Paste the Web App URL you get after deploying code.ts (Apps Script) here.
// It must end with /exec
export const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwBFSFDJrXjvoupm1h2tyAb8CiqY4vc3PFRtTmcFVthkvkOYDwFw2Fl1c94qXPwCZRP/exec';

// ─────────────────────────────────────────────────────────────
// Guest name helpers (shared by /admin and the invitation)
// ─────────────────────────────────────────────────────────────

export const PREFIXES = ['Mr.', 'Mrs.', 'Miss', 'Mr. & Mrs.', 'Family', 'Dear'] as const;
export type Prefix = (typeof PREFIXES)[number];

/** Combines a prefix and a name into the name shown to the guest. */
export function buildDisplayName(prefix: Prefix, rawName: string): string {
  const name = rawName.trim().replace(/\s+/g, ' ');
  if (!name) return '';
  switch (prefix) {
    case 'Family':
      return `${name} and Family`;
    case 'Dear':
      // "Dear" is a greeting style only – it is added by the greeting, never to the name.
      return name;
    default:
      return `${prefix} ${name}`;
  }
}

/** Personalised link: {baseURL}/{display name, URL-encoded}. */
export function buildInviteLink(baseUrl: string, displayName: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/${encodeURIComponent(displayName)}`;
}

/** Reads the guest display name from the current URL (path or legacy ?prefix=&name=). */
export function getGuestFromUrl(): string {
  if (typeof window === 'undefined') return '';

  const params = new URLSearchParams(window.location.search);
  const legacyName = params.get('name');
  if (legacyName) {
    const legacyPrefix = params.get('prefix') as Prefix | null;
    return legacyPrefix && (PREFIXES as readonly string[]).includes(legacyPrefix)
      ? buildDisplayName(legacyPrefix, legacyName)
      : legacyName.trim();
  }

  const segment = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (!segment || segment.toLowerCase() === 'admin') return '';
  try {
    return decodeURIComponent(segment).replace(/\s+/g, ' ').trim();
  } catch {
    return segment;
  }
}

/** Sends a row to the Google Sheet through the Apps Script web app. */
export async function submitToSheet(sheet: 'RSVP' | 'Wishes', data: Record<string, string>) {
  if (!GOOGLE_SCRIPT_URL) {
    throw new Error('GOOGLE_SCRIPT_URL is not set in src/config.ts');
  }
  const body = new URLSearchParams({ sheet, ...data });
  // no-cors: Apps Script does not send CORS headers; the request still reaches the script.
  await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body });
}

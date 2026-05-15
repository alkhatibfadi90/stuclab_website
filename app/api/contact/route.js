// Contact form handler — ported from the Vercel serverless function
// (api/contact.js). The email + spam-handling logic is preserved exactly;
// only the function signature is adapted to the Next.js Route Handler API
// (Web Request / Response instead of Node req / res).

const RESEND_API_URL = 'https://api.resend.com/emails';
const defaultRecipient = 'info@struclab.com.au';
const requestLogByIp = new Map();
const DEFAULT_RATE_LIMIT_MAX = 5;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

function sanitize(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getClientIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (typeof realIp === 'string' && realIp.length > 0) {
    return realIp.trim();
  }

  return 'unknown';
}

function isRateLimited(clientIp, limitMax, limitWindowMs) {
  const now = Date.now();
  const windowStart = now - limitWindowMs;
  const previous = requestLogByIp.get(clientIp) || [];
  const recent = previous.filter((timestamp) => timestamp > windowStart);

  if (recent.length >= limitMax) {
    requestLogByIp.set(clientIp, recent);
    return true;
  }

  recent.push(now);
  requestLogByIp.set(clientIp, recent);
  return false;
}

export async function POST(request) {
  const rateLimitMax = parsePositiveInt(process.env.CONTACT_RATE_LIMIT_MAX, DEFAULT_RATE_LIMIT_MAX);
  const rateLimitWindowMs = parsePositiveInt(
    process.env.CONTACT_RATE_LIMIT_WINDOW_MS,
    DEFAULT_RATE_LIMIT_WINDOW_MS,
  );
  const clientIp = getClientIp(request);

  if (isRateLimited(clientIp, rateLimitMax, rateLimitWindowMs)) {
    return Response.json({ error: 'Too many requests' }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  const toEmail = process.env.CONTACT_TO_EMAIL || defaultRecipient;

  if (!apiKey || !fromEmail) {
    return Response.json({ error: 'Email provider is not configured' }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const name = sanitize(body?.name);
  const email = sanitize(body?.email);
  const company = sanitize(body?.company);
  const message = sanitize(body?.message);
  const website = sanitize(body?.website);

  if (website) {
    return Response.json({ ok: true });
  }

  if (!name || !email || !message) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const text = [
    `New enquiry from ${name}`,
    `Email: ${email}`,
    `Company: ${company || 'N/A'}`,
    '',
    'Message:',
    message,
  ].join('\n');

  try {
    const resendResponse = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `New StrucLab enquiry from ${name}`,
        text,
      }),
    });

    if (!resendResponse.ok) {
      let providerError = 'Email provider returned an error';

      try {
        providerError = (await resendResponse.text()).slice(0, 300);
      } catch {
        providerError = 'Unable to parse email provider error';
      }

      return Response.json(
        { error: 'Email send failed', details: providerError },
        { status: 502 },
      );
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: 'Email send failed' }, { status: 502 });
  }
}

export function GET() {
  return Response.json(
    { error: 'Method not allowed' },
    { status: 405, headers: { Allow: 'POST' } },
  );
}

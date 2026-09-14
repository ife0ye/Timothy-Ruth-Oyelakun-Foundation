import { randomBytes } from 'node:crypto';
import { assertSameOrigin, cleanText, clientIp, handleError, HttpError, json, rateLimit, readJson } from '../_lib/http.js';
import { flutterwave } from '../_lib/flutterwave.js';
import { checkAmount, EMAIL_PATTERN, isCurrency, LIMITS, TX_REF_PREFIX } from '../../shared/donation.js';

function siteUrl(request: Request): string {
  return (process.env.SITE_URL ?? new URL(request.url).origin).replace(/\/+$/, '');
}

export async function POST(request: Request): Promise<Response> {
  try {
    assertSameOrigin(request);
    rateLimit(`donate:${clientIp(request)}`, 8, 10 * 60_000);

    const body = await readJson(request);
    const amount = typeof body.amount === 'number' ? body.amount : Number.NaN;
    const currency = body.currency;
    const name = cleanText(body.name, LIMITS.name);
    const email = cleanText(body.email, LIMITS.email).toLowerCase();
    const phone = cleanText(body.phone, LIMITS.phone).replace(/[^\d+()\-\s]/g, '');

    if (!isCurrency(currency)) throw new HttpError(400, 'Please choose a supported currency.');
    const amountError = checkAmount(amount, currency);
    if (amountError) throw new HttpError(400, amountError);
    if (!name) throw new HttpError(400, 'Please tell us your name.');
    if (!EMAIL_PATTERN.test(email)) throw new HttpError(400, 'Please enter a valid email address.');

    const txRef = `${TX_REF_PREFIX}-${Date.now().toString(36)}-${randomBytes(8).toString('hex')}`;
    const site = siteUrl(request);

    const data = await flutterwave<{ link?: string }>('/payments', {
      method: 'POST',
      body: JSON.stringify({
        tx_ref: txRef,
        amount,
        currency,
        redirect_url: `${site}/`,
        session_duration: 30,
        customer: { email, name, ...(phone ? { phonenumber: phone } : {}) },
        customizations: {
          title: 'Timothy & Ruth Oyelakun Foundation',
          description: 'Donation',
          logo: `${site}/images/seal-512.png`,
        },
        meta: { source: 'website' },
      }),
    });

    if (!data.link?.startsWith('https://')) throw new Error('Flutterwave returned no checkout link');
    return json({ link: data.link });
  } catch (error) {
    if (!(error instanceof HttpError)) {
      console.error('[donations/create]', error instanceof Error ? error.message : error);
      return json({ error: 'We could not open the secure checkout just now. Please try again in a minute.' }, 502);
    }
    return handleError(error, 'donations/create');
  }
}

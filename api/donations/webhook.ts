import { createHash, timingSafeEqual } from 'node:crypto';
import { json } from '../_lib/http.js';
import { verifyByReference } from '../_lib/flutterwave.js';
import { emailConfigured, htmlRows, sendEmail } from '../_lib/email.js';
import { formatMoney, TX_REF_PATTERN } from '../../shared/donation.js';

function signatureMatches(received: string | null): boolean {
  const expected = process.env.FLW_WEBHOOK_HASH;
  if (!expected || !received) return false;
  // Hash both sides so the comparison is constant-time regardless of length.
  const a = createHash('sha256').update(received).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<Response> {
  if (!signatureMatches(request.headers.get('verif-hash'))) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let event: { event?: string; data?: { tx_ref?: string } };
  try {
    event = JSON.parse(await request.text());
  } catch {
    return json({ received: true });
  }

  const txRef = event.data?.tx_ref ?? '';
  // Only act on completed charges that this website created.
  if (event.event !== 'charge.completed' || !TX_REF_PATTERN.test(txRef)) {
    return json({ received: true });
  }

  try {
    // The webhook body is only a hint; confirm the payment with Flutterwave before acting on it.
    const tx = await verifyByReference(txRef);
    if (!tx?.successful || !tx.currency) {
      console.info('[webhook] not successful', txRef, tx?.status);
      return json({ received: true });
    }

    console.info('[webhook] donation confirmed', txRef);

    if (emailConfigured()) {
      const to = process.env.DONATION_NOTIFY_EMAIL || process.env.CONTACT_TO_EMAIL!;
      const amount = formatMoney(tx.amount, tx.currency);
      const rows: [string, string][] = [
        ['Amount', `${amount} (${tx.currency})`],
        ['Donor', tx.customerName || '—'],
        ['Email', tx.customerEmail || '—'],
        ['Method', tx.paymentType || '—'],
        ['Reference', tx.txRef],
        ['Flutterwave ID', String(tx.id)],
        ['Date', tx.createdAt || new Date().toISOString()],
      ];
      await sendEmail({
        to,
        subject: `New donation: ${amount} from ${tx.customerName || 'a donor'}`,
        text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
        html: `<p style="font:15px -apple-system,Segoe UI,sans-serif">A donation was confirmed on the website.</p>${htmlRows(rows)}`,
        replyTo: tx.customerEmail || undefined,
      });
    }
  } catch (error) {
    // Still acknowledge: the payment itself is safe in Flutterwave, and retries would only duplicate emails.
    console.error('[webhook]', error instanceof Error ? error.message : error);
  }

  return json({ received: true });
}

import { clientIp, handleError, HttpError, json, rateLimit } from '../_lib/http.js';
import { verifyByReference } from '../_lib/flutterwave.js';
import { TX_REF_PATTERN } from '../../shared/donation.js';

// Called when a donor returns from checkout. Only reveals the outcome, amount and currency.
// Never the donor's email, card or other details, since anyone holding a reference could call it.
export async function GET(request: Request): Promise<Response> {
  try {
    rateLimit(`verify:${clientIp(request)}`, 30, 10 * 60_000);

    const txRef = new URL(request.url).searchParams.get('tx_ref') ?? '';
    if (!TX_REF_PATTERN.test(txRef)) throw new HttpError(400, 'Unknown donation reference.');

    const tx = await verifyByReference(txRef);
    if (!tx) return json({ status: 'not_found' });

    if (tx.successful) {
      return json({ status: 'successful', amount: tx.amount, currency: tx.currency });
    }
    const status = tx.status === 'failed' ? 'failed' : 'pending';
    return json({ status });
  } catch (error) {
    return handleError(error, 'donations/verify');
  }
}

import { requireEnv } from './http.js';
import { isCurrency, type CurrencyCode } from '../../shared/donation.js';

const BASE = 'https://api.flutterwave.com/v3';

export async function flutterwave<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${requireEnv('FLW_SECRET_KEY')}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
    signal: AbortSignal.timeout(15_000),
  });

  const body = (await response.json().catch(() => null)) as { status?: string; message?: string; data?: unknown } | null;
  if (!response.ok || body?.status !== 'success') {
    // Log Flutterwave's reason server-side only; never forward it to the browser.
    throw new Error(`Flutterwave ${path} failed (${response.status}): ${body?.message ?? 'no message'}`);
  }
  return body.data as T;
}

export interface VerifiedTransaction {
  successful: boolean;
  status: string;
  txRef: string;
  amount: number;
  currency: CurrencyCode | null;
  customerName: string;
  customerEmail: string;
  paymentType: string;
  createdAt: string;
  id: number;
}

interface FlwTransaction {
  id: number;
  tx_ref: string;
  status: string;
  amount: number;
  currency: string;
  payment_type?: string;
  created_at?: string;
  customer?: { name?: string; email?: string };
}

/** Asks Flutterwave directly for the truth about a transaction. Never trust redirect or webhook payloads alone. */
export async function verifyByReference(txRef: string): Promise<VerifiedTransaction | null> {
  let data: FlwTransaction;
  try {
    data = await flutterwave<FlwTransaction>(`/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`);
  } catch (error) {
    // Flutterwave answers with an error when no transaction exists yet for the reference.
    console.warn('[verify]', error instanceof Error ? error.message : error);
    return null;
  }

  const currency = isCurrency(data.currency) ? data.currency : null;
  return {
    successful: data.status === 'successful' && data.tx_ref === txRef && currency !== null,
    status: data.status,
    txRef: data.tx_ref,
    amount: Number(data.amount),
    currency,
    customerName: data.customer?.name ?? '',
    customerEmail: data.customer?.email ?? '',
    paymentType: data.payment_type ?? '',
    createdAt: data.created_at ?? '',
    id: data.id,
  };
}

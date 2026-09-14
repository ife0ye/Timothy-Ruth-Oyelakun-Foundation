// Single source of truth for donation rules. Imported by both the site and the API,
// so the client can never offer something the server will reject.

export type CurrencyCode = 'NGN' | 'USD' | 'GBP' | 'EUR' | 'CAD';

export interface CurrencyRule {
  code: CurrencyCode;
  symbol: string;
  label: string;
  min: number;
  max: number;
  presets: number[];
}

export const CURRENCIES: Record<CurrencyCode, CurrencyRule> = {
  NGN: { code: 'NGN', symbol: '₦', label: 'Naira', min: 500, max: 50_000_000, presets: [5_000, 10_000, 25_000, 50_000] },
  USD: { code: 'USD', symbol: '$', label: 'US Dollar', min: 5, max: 50_000, presets: [25, 50, 100, 250] },
  GBP: { code: 'GBP', symbol: '£', label: 'Pound', min: 5, max: 50_000, presets: [20, 50, 100, 250] },
  EUR: { code: 'EUR', symbol: '€', label: 'Euro', min: 5, max: 50_000, presets: [25, 50, 100, 250] },
  CAD: { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar', min: 5, max: 50_000, presets: [25, 50, 100, 250] },
};

export const CURRENCY_CODES = Object.keys(CURRENCIES) as CurrencyCode[];

export const TX_REF_PREFIX = 'TROF';
export const TX_REF_PATTERN = /^TROF-[a-z0-9]{6,12}-[a-f0-9]{16}$/;

export const LIMITS = {
  name: 100,
  email: 200,
  phone: 30,
  subject: 150,
  message: 5000,
} as const;

export const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;

export function isCurrency(value: unknown): value is CurrencyCode {
  return typeof value === 'string' && value in CURRENCIES;
}

/** Returns an error message, or null when the amount is acceptable. */
export function checkAmount(amount: number, currency: CurrencyCode): string | null {
  const rule = CURRENCIES[currency];
  if (!Number.isFinite(amount) || amount <= 0) return 'Please enter an amount.';
  if (Math.abs(Math.round(amount * 100) - amount * 100) > 1e-6) return 'Amounts can have at most two decimal places.';
  if (amount < rule.min) return `The minimum gift is ${formatMoney(rule.min, currency)}.`;
  if (amount > rule.max) return `For gifts above ${formatMoney(rule.max, currency)}, please contact us directly.`;
  return null;
}

export function formatMoney(amount: number, currency: CurrencyCode): string {
  const rule = CURRENCIES[currency];
  const digits = Number.isInteger(amount) ? 0 : 2;
  return `${rule.symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: 2 })}`;
}

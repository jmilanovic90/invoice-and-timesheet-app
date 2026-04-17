import type { CurrencyCode } from '../../../shared/types/currency';

export function formatCurrency(value: number, currency: CurrencyCode = 'EUR'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(value);
}

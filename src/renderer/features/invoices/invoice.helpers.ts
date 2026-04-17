import type { InvoiceDraft, InvoiceItem } from '../../../shared/types/invoice';

export function calculateInvoiceItemTotal(item: InvoiceItem): number {
  const gross = item.quantity * item.price;
  const discountValue = gross * (item.discount / 100);
  return roundCurrency(gross - discountValue);
}

export function calculateInvoiceTotals(items: InvoiceItem[]): {
  subtotal: number;
  discountTotal: number;
  grandTotal: number;
} {
  const subtotal = roundCurrency(items.reduce((sum, item) => sum + item.quantity * item.price, 0));
  const grandTotal = roundCurrency(items.reduce((sum, item) => sum + calculateInvoiceItemTotal(item), 0));
  const discountTotal = roundCurrency(subtotal - grandTotal);

  return {
    subtotal,
    discountTotal,
    grandTotal
  };
}

export function normalizeInvoiceDraft(draft: InvoiceDraft): InvoiceDraft {
  return {
    ...draft,
    items: draft.items.map((item) => ({
      ...item,
      total: calculateInvoiceItemTotal(item)
    }))
  };
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

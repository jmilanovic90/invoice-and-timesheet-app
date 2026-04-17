import assert from 'node:assert/strict';
import type { InvoiceDraft } from '../../../shared/types/invoice';
import {
  calculateInvoiceItemTotal,
  calculateInvoiceTotals,
  normalizeInvoiceDraft,
  roundCurrency
} from './invoice.helpers';

const draft: InvoiceDraft = {
  invoiceDate: '2026-04-17',
  tradingDate: '2026-04-17',
  tradingPlace: 'Novi Sad',
  clientId: 'client-1',
  issuerIban: 'RS001',
  currency: 'EUR',
  notes: 'Note',
  taxNote: 'Tax note',
  paymentDeadlineDays: 15,
  items: [
    {
      id: 'item-1',
      description: 'Service A',
      unit: 'hour',
      quantity: 2,
      price: 50,
      discount: 10,
      total: 0
    },
    {
      id: 'item-2',
      description: 'Service B',
      unit: 'day',
      quantity: 1,
      price: 99.995,
      discount: 0,
      total: 0
    }
  ]
};

export function runInvoiceHelperTests(): void {
  assert.equal(roundCurrency(12.345), 12.35);
  assert.equal(roundCurrency(12.344), 12.34);
  assert.equal(calculateInvoiceItemTotal(draft.items[0]!), 90);
  assert.deepEqual(calculateInvoiceTotals(draft.items), {
    subtotal: 200,
    discountTotal: 10,
    grandTotal: 190
  });

  const normalized = normalizeInvoiceDraft(draft);
  assert.equal(normalized.items[0]?.total, 90);
  assert.equal(normalized.items[1]?.total, 100);
}

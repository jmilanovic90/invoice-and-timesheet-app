import assert from 'node:assert/strict';
import type { InvoiceDraft } from '../../../shared/types/invoice';
import { validateInvoice } from './invoice.validation';

const validDraft: InvoiceDraft = {
  invoiceDate: '2026-04-17',
  tradingDate: '2026-04-17',
  tradingPlace: 'Novi Sad',
  clientId: 'client-1',
  issuerIban: 'RS35325960170008442473',
  currency: 'EUR',
  notes: '',
  taxNote: '',
  paymentDeadlineDays: 15,
  items: [
    {
      id: 'item-1',
      description: 'Service',
      unit: 'service',
      quantity: 1,
      price: 100,
      discount: 0,
      total: 100
    }
  ]
};

export function runInvoiceValidationTests(): void {
  assert.deepEqual(validateInvoice(validDraft), {});
  assert.deepEqual(
    validateInvoice({
      ...validDraft,
      clientId: '',
      invoiceDate: '',
      tradingDate: 'bad',
      tradingPlace: '   ',
      issuerIban: 'bad',
      paymentDeadlineDays: 0,
      notes: 'x'.repeat(1501),
      taxNote: 'y'.repeat(1501),
      items: [{ ...validDraft.items[0]!, description: '', quantity: 0, price: -1, discount: 101 }]
    }),
    {
      clientId: 'A client must be selected.',
      invoiceDate: 'Invoice date is required.',
      tradingDate: 'Trading date is required.',
      tradingPlace: 'Trading place is required.',
      paymentDeadlineDays: 'Payment deadline must be between 1 and 365 days.',
      issuerIban: 'Enter a valid IBAN.',
      notes: 'Comment must be 1500 characters or fewer.',
      taxNote: 'Tax note must be 1500 characters or fewer.',
      items: 'Each line item needs a valid description, quantity, price, and discount.'
    }
  );
}

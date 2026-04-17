import assert from 'node:assert/strict';
import type { InvoiceDraft } from '../../../shared/types/invoice';
import { validateInvoice } from './invoice.validation';

const validDraft: InvoiceDraft = {
  invoiceDate: '2026-04-17',
  tradingDate: '2026-04-17',
  tradingPlace: 'Novi Sad',
  clientId: 'client-1',
  issuerIban: 'RS001',
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
      tradingPlace: '   ',
      items: [{ ...validDraft.items[0]!, description: '', quantity: 0, price: -1, discount: -1 }]
    }),
    {
      clientId: 'A client must be selected.',
      tradingPlace: 'Trading place is required.',
      items: 'Each line item needs a description, quantity, and price.'
    }
  );
}

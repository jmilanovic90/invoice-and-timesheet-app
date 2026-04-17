import assert from 'node:assert/strict';
import type { Invoice } from '../../../shared/types/invoice';
import { generateInvoiceNumber } from './invoice-number.service';

const baseInvoice = {
  id: '1',
  invoiceDate: '2026-01-10',
  tradingDate: '2026-01-10',
  tradingPlace: 'Novi Sad',
  clientId: 'client-1',
  issuerIban: 'RS001',
  currency: 'EUR' as const,
  notes: '',
  taxNote: '',
  paymentDeadlineDays: 15,
  items: [],
  subtotal: 0,
  discountTotal: 0,
  grandTotal: 0
};

export function runInvoiceNumberTests(): void {
  const sameYearInvoices: Invoice[] = [
    { ...baseInvoice, id: 'a', invoiceNumber: '4/2026' },
    { ...baseInvoice, id: 'b', invoiceNumber: '9/2025' },
    { ...baseInvoice, id: 'c', invoiceNumber: '7/2026' }
  ];

  assert.equal(generateInvoiceNumber(sameYearInvoices, '2026-04-17'), '8/2026');

  const otherYearInvoices: Invoice[] = [{ ...baseInvoice, id: 'a', invoiceNumber: '9/2025' }];
  assert.equal(generateInvoiceNumber(otherYearInvoices, '2026-04-17'), '1/2026');
}

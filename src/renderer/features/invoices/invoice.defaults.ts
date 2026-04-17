import type { InvoiceDraft, InvoiceItem } from '../../../shared/types/invoice';
import { createId } from '../../lib/utils/id';
import { getTodayLocalIsoDate } from '../../lib/utils/date';

export function createEmptyInvoiceItem(): InvoiceItem {
  return {
    id: createId('item'),
    description: '',
    unit: 'hour',
    quantity: 1,
    price: 0,
    discount: 0,
    total: 0
  };
}

export const defaultInvoiceDraft: InvoiceDraft = {
  invoiceDate: getTodayLocalIsoDate(),
  tradingDate: getTodayLocalIsoDate(),
  tradingPlace: '',
  clientId: '',
  issuerIban: '',
  currency: 'EUR',
  notes:
    'Payment deadline is 15 days.\nWhen making the payment, please provide the reference number.',
  taxNote:
    'Not in the VAT system. VAT not calculated on the invoice according to article 33 of Law on value added tax.',
  paymentDeadlineDays: 15,
  items: [createEmptyInvoiceItem()]
};

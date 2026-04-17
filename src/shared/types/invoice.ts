import type { CurrencyCode } from './currency';

export type InvoiceUnit = 'hour' | 'day' | 'service';

export interface InvoiceItem {
  id: string;
  description: string;
  unit: InvoiceUnit;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  tradingDate: string;
  tradingPlace: string;
  clientId: string;
  issuerIban: string;
  currency: CurrencyCode;
  notes: string;
  taxNote: string;
  paymentDeadlineDays: number;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  grandTotal: number;
}

export type InvoiceDraft = Omit<
  Invoice,
  'id' | 'invoiceNumber' | 'subtotal' | 'discountTotal' | 'grandTotal'
>;

import type { Invoice, InvoiceDraft } from '../../../shared/types/invoice';
import { WebStorage } from '../../lib/storage/web-storage';
import { createId } from '../../lib/utils/id';
import { calculateInvoiceTotals, normalizeInvoiceDraft } from './invoice.helpers';
import { generateInvoiceNumber } from './invoice-number.service';

const storage = new WebStorage();
const invoicesStorageKey = 'invoice-app/invoices';

const seededInvoices: Invoice[] = [
  {
    id: 'f9037dae527f5430a3a0c14a9a4fd50c7afcd9523e60531585d1b388b883ade7',
    invoiceNumber: '10/2025',
    invoiceDate: '2025-06-12',
    tradingDate: '2025-06-12',
    tradingPlace: 'Novi Sad',
    clientId: 'client-service-ocean',
    issuerIban: 'RS35325960170008442473',
    currency: 'EUR',
    notes: 'Payment deadline is 15 days.',
    taxNote:
      'Not in the VAT system. VAT not calculated according to article 33 of Law on value added tax.',
    paymentDeadlineDays: 15,
    items: [
      {
        id: 'item-seed-1',
        description: 'E2E Test Automation of Regression Set',
        unit: 'hour',
        quantity: 20,
        price: 50,
        discount: 0,
        total: 1000
      }
    ],
    subtotal: 1000,
    discountTotal: 0,
    grandTotal: 1000
  }
];

function normalizeInvoice(invoice: Invoice & { issuerIban?: string }): Invoice {
  return {
    ...invoice,
    issuerIban: invoice.issuerIban || ''
  };
}

export function getInvoices(): Promise<Invoice[]> {
  const stored = storage.read(invoicesStorageKey, seededInvoices as Array<Invoice & { issuerIban?: string }>);
  return Promise.resolve(stored.map(normalizeInvoice));
}

export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
  const invoices = await getInvoices();
  return invoices.find((invoice) => invoice.id === invoiceId) ?? null;
}

export async function createInvoice(draft: InvoiceDraft): Promise<Invoice> {
  const invoices = await getInvoices();
  const normalizedDraft = normalizeInvoiceDraft(draft);
  const totals = calculateInvoiceTotals(normalizedDraft.items);

  const nextInvoice: Invoice = {
    ...normalizedDraft,
    id: createId('invoice'),
    invoiceNumber: generateInvoiceNumber(invoices, normalizedDraft.invoiceDate),
    ...totals
  };

  storage.write(invoicesStorageKey, [nextInvoice, ...invoices]);
  return nextInvoice;
}

export async function updateInvoice(invoiceId: string, draft: InvoiceDraft): Promise<Invoice | null> {
  const invoices = await getInvoices();
  const existingInvoice = invoices.find((invoice) => invoice.id === invoiceId);

  if (!existingInvoice) {
    return null;
  }

  const normalizedDraft = normalizeInvoiceDraft(draft);
  const totals = calculateInvoiceTotals(normalizedDraft.items);

  const nextInvoice: Invoice = {
    ...existingInvoice,
    ...normalizedDraft,
    ...totals
  };

  storage.write(
    invoicesStorageKey,
    invoices.map((invoice) => (invoice.id === invoiceId ? nextInvoice : invoice))
  );

  return nextInvoice;
}

export async function deleteInvoice(invoiceId: string): Promise<void> {
  const invoices = await getInvoices();
  storage.write(
    invoicesStorageKey,
    invoices.filter((invoice) => invoice.id !== invoiceId)
  );
}

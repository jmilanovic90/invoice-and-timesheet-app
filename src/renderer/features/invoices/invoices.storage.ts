import type { Invoice, InvoiceDraft } from '../../../shared/types/invoice';
import { WebStorage } from '../../lib/storage/web-storage';
import { createId } from '../../lib/utils/id';
import { calculateInvoiceTotals, normalizeInvoiceDraft } from './invoice.helpers';
import { generateInvoiceNumber } from './invoice-number.service';

const storage = new WebStorage();
const invoicesStorageKey = 'invoice-app/invoices-v2';
const legacyInvoicesStorageKey = 'invoice-app/invoices';

function normalizeInvoice(invoice: Invoice & { issuerIban?: string }): Invoice {
  return {
    ...invoice,
    issuerIban: invoice.issuerIban || ''
  };
}

export function getInvoices(): Promise<Invoice[]> {
  storage.remove(legacyInvoicesStorageKey);
  const stored = storage.read(invoicesStorageKey, [] as Array<Invoice & { issuerIban?: string }>);
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
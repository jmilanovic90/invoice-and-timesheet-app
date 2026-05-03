import type { Invoice, InvoiceDraft } from '../../shared/types/invoice';
import { supabaseAdmin } from '../lib/supabase-admin';
import { calculateInvoiceTotals, normalizeInvoiceDraft } from '../../renderer/features/invoices/invoice.helpers';
import { type InvoiceRow, toInvoice, toInvoiceRow } from './mappers';

function generateInvoiceNumber(invoices: Invoice[], invoiceDate: string): string {
  const year = new Date(invoiceDate).getFullYear();
  const usedNumbers = invoices
    .map((invoice) => invoice.invoiceNumber)
    .filter((invoiceNumber) => invoiceNumber.endsWith(`/${year}`))
    .map((invoiceNumber) => Number.parseInt(invoiceNumber.split('/')[0] ?? '0', 10))
    .filter((value) => Number.isFinite(value));

  const nextNumber = (Math.max(0, ...usedNumbers) || 0) + 1;
  return `${nextNumber}/${year}`;
}

export async function listInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .order('invoice_date', { ascending: false })
    .returns<InvoiceRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(toInvoice);
}

export async function readInvoice(invoiceId: string): Promise<Invoice | null> {
  const { data, error } = await supabaseAdmin
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .maybeSingle<InvoiceRow>();

  if (error) {
    throw error;
  }

  return data ? toInvoice(data) : null;
}

export async function createInvoiceRecord(draft: InvoiceDraft, createId: () => string): Promise<Invoice> {
  const invoices = await listInvoices();
  const normalizedDraft = normalizeInvoiceDraft(draft);
  const totals = calculateInvoiceTotals(normalizedDraft.items);

  const nextInvoice: Invoice = {
    ...normalizedDraft,
    id: createId(),
    invoiceNumber: generateInvoiceNumber(invoices, normalizedDraft.invoiceDate),
    ...totals
  };

  const { data, error } = await supabaseAdmin
    .from('invoices')
    .insert(toInvoiceRow(nextInvoice))
    .select('*')
    .single<InvoiceRow>();

  if (error) {
    throw error;
  }

  return toInvoice(data);
}

export async function updateInvoiceRecord(invoiceId: string, draft: InvoiceDraft): Promise<Invoice | null> {
  const existingInvoice = await readInvoice(invoiceId);

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

  const { data, error } = await supabaseAdmin
    .from('invoices')
    .update(toInvoiceRow(nextInvoice))
    .eq('id', invoiceId)
    .select('*')
    .single<InvoiceRow>();

  if (error) {
    throw error;
  }

  return toInvoice(data);
}

export async function deleteInvoiceRecord(invoiceId: string): Promise<void> {
  const { error } = await supabaseAdmin.from('invoices').delete().eq('id', invoiceId);

  if (error) {
    throw error;
  }
}

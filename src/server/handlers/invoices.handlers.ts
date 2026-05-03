import type { InvoiceDraft } from '../../shared/types/invoice';
import { createId } from '../../renderer/lib/utils/id';
import { sendSupabaseError } from '../lib/http';
import {
  createInvoiceRecord,
  deleteInvoiceRecord,
  listInvoices,
  readInvoice,
  updateInvoiceRecord
} from '../services/invoices.service';

interface ResponseLike {
  status(code: number): ResponseLike;
  json(payload: unknown): void;
  send(payload?: unknown): void;
}

export async function listInvoicesHandler(res: ResponseLike): Promise<void> {
  try {
    const invoices = await listInvoices();
    res.status(200).json(invoices);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not load invoices.');
  }
}

export async function getInvoiceHandler(invoiceId: string, res: ResponseLike): Promise<void> {
  try {
    const invoice = await readInvoice(invoiceId);

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found.' });
      return;
    }

    res.status(200).json(invoice);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not load invoice.');
  }
}

export async function createInvoiceHandler(body: unknown, res: ResponseLike): Promise<void> {
  try {
    const draft = body as InvoiceDraft;
    const invoice = await createInvoiceRecord(draft, () => createId('invoice'));
    res.status(201).json(invoice);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not create invoice.');
  }
}

export async function updateInvoiceHandler(invoiceId: string, body: unknown, res: ResponseLike): Promise<void> {
  try {
    const invoice = await updateInvoiceRecord(invoiceId, body as InvoiceDraft);

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found.' });
      return;
    }

    res.status(200).json(invoice);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not update invoice.');
  }
}

export async function deleteInvoiceHandler(invoiceId: string, res: ResponseLike): Promise<void> {
  try {
    await deleteInvoiceRecord(invoiceId);
    res.status(204).send();
  } catch (error) {
    sendSupabaseError(res, error, 'Could not delete invoice.');
  }
}

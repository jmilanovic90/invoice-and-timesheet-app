import { Router } from 'express';
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

export const invoicesRouter = Router();

invoicesRouter.get('/', async (_req, res) => {
  try {
    const invoices = await listInvoices();
    res.status(200).json(invoices);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not load invoices.');
  }
});

invoicesRouter.get('/:id', async (req, res) => {
  try {
    const invoice = await readInvoice(req.params.id);

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found.' });
      return;
    }

    res.status(200).json(invoice);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not load invoice.');
  }
});

invoicesRouter.post('/', async (req, res) => {
  try {
    const draft = req.body as InvoiceDraft;
    const invoice = await createInvoiceRecord(draft, () => createId('invoice'));
    res.status(201).json(invoice);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not create invoice.');
  }
});

invoicesRouter.put('/:id', async (req, res) => {
  try {
    const invoice = await updateInvoiceRecord(req.params.id, req.body as InvoiceDraft);

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found.' });
      return;
    }

    res.status(200).json(invoice);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not update invoice.');
  }
});

invoicesRouter.delete('/:id', async (req, res) => {
  try {
    await deleteInvoiceRecord(req.params.id);
    res.status(204).send();
  } catch (error) {
    sendSupabaseError(res, error, 'Could not delete invoice.');
  }
});

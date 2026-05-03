import { Router } from 'express';
import {
  createInvoiceHandler,
  deleteInvoiceHandler,
  getInvoiceHandler,
  listInvoicesHandler,
  updateInvoiceHandler
} from '../handlers/invoices.handlers';

export const invoicesRouter = Router();

invoicesRouter.get('/', async (_req, res) => {
  await listInvoicesHandler(res);
});

invoicesRouter.get('/:id', async (req, res) => {
  await getInvoiceHandler(req.params.id, res);
});

invoicesRouter.post('/', async (req, res) => {
  await createInvoiceHandler(req.body, res);
});

invoicesRouter.put('/:id', async (req, res) => {
  await updateInvoiceHandler(req.params.id, req.body, res);
});

invoicesRouter.delete('/:id', async (req, res) => {
  await deleteInvoiceHandler(req.params.id, res);
});

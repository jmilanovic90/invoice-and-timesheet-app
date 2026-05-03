import { Router } from 'express';
import {
  createClientHandler,
  deleteClientHandler,
  listClientsHandler,
  updateClientHandler
} from '../handlers/clients.handlers';

export const clientsRouter = Router();

clientsRouter.get('/', async (_req, res) => {
  await listClientsHandler(res);
});

clientsRouter.post('/', async (req, res) => {
  await createClientHandler(req.body, res);
});

clientsRouter.put('/:id', async (req, res) => {
  await updateClientHandler(req.params.id, req.body, res);
});

clientsRouter.delete('/:id', async (req, res) => {
  await deleteClientHandler(req.params.id, res);
});

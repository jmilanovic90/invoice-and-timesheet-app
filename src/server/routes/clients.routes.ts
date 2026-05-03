import { Router } from 'express';
import type { Client } from '../../shared/types/client';
import { sendSupabaseError } from '../lib/http';
import {
  createClientRecord,
  deleteClientRecord,
  listClients,
  updateClientRecord
} from '../services/clients.service';

export const clientsRouter = Router();

clientsRouter.get('/', async (_req, res) => {
  try {
    const clients = await listClients();
    res.status(200).json(clients);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not load clients.');
  }
});

clientsRouter.post('/', async (req, res) => {
  try {
    const client = req.body as Client;
    const savedClient = await createClientRecord(client);
    res.status(201).json(savedClient);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not create client.');
  }
});

clientsRouter.put('/:id', async (req, res) => {
  try {
    const client = { ...(req.body as Client), id: req.params.id };
    const savedClient = await updateClientRecord(client);
    res.status(200).json(savedClient);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not update client.');
  }
});

clientsRouter.delete('/:id', async (req, res) => {
  try {
    await deleteClientRecord(req.params.id);
    res.status(204).send();
  } catch (error) {
    sendSupabaseError(res, error, 'Could not delete client.');
  }
});

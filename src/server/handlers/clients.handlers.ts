import type { Client } from '../../shared/types/client';
import { sendSupabaseError } from '../lib/http';
import {
  createClientRecord,
  deleteClientRecord,
  listClients,
  updateClientRecord
} from '../services/clients.service';

interface ResponseLike {
  status(code: number): ResponseLike;
  json(payload: unknown): void;
  send(payload?: unknown): void;
}

export async function listClientsHandler(res: ResponseLike): Promise<void> {
  try {
    const clients = await listClients();
    res.status(200).json(clients);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not load clients.');
  }
}

export async function createClientHandler(body: unknown, res: ResponseLike): Promise<void> {
  try {
    const client = body as Client;
    const savedClient = await createClientRecord(client);
    res.status(201).json(savedClient);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not create client.');
  }
}

export async function updateClientHandler(clientId: string, body: unknown, res: ResponseLike): Promise<void> {
  try {
    const client = { ...(body as Client), id: clientId };
    const savedClient = await updateClientRecord(client);
    res.status(200).json(savedClient);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not update client.');
  }
}

export async function deleteClientHandler(clientId: string, res: ResponseLike): Promise<void> {
  try {
    await deleteClientRecord(clientId);
    res.status(204).send();
  } catch (error) {
    sendSupabaseError(res, error, 'Could not delete client.');
  }
}

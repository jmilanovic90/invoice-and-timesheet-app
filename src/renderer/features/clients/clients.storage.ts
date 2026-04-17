import type { Client } from '../../../shared/types/client';
import { WebStorage } from '../../lib/storage/web-storage';
import { createId } from '../../lib/utils/id';

const storage = new WebStorage();
const clientsStorageKey = 'invoice-app/clients-v2';
const legacyClientsStorageKey = 'invoice-app/clients';

export function getClients(): Promise<Client[]> {
  storage.remove(legacyClientsStorageKey);
  return Promise.resolve(storage.read(clientsStorageKey, [] as Client[]));
}

export async function createClient(values: Omit<Client, 'id'>): Promise<Client> {
  const clients = await getClients();
  const nextClient: Client = {
    ...values,
    id: createId('client')
  };

  storage.write(clientsStorageKey, [...clients, nextClient]);
  return nextClient;
}

export async function updateClient(values: Client): Promise<Client> {
  const clients = await getClients();
  const nextClients = clients.map((client) => (client.id === values.id ? values : client));

  storage.write(clientsStorageKey, nextClients);
  return values;
}

export async function deleteClient(clientId: string): Promise<void> {
  const clients = await getClients();
  const nextClients = clients.filter((client) => client.id !== clientId);

  storage.write(clientsStorageKey, nextClients);
}
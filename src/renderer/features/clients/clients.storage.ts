import type { Client } from '../../../shared/types/client';
import { WebStorage } from '../../lib/storage/web-storage';
import { createId } from '../../lib/utils/id';

const storage = new WebStorage();
const clientsStorageKey = 'invoice-app/clients';

const seededClients: Client[] = [
  {
    id: 'client-service-ocean',
    name: 'ServiceOcean AG',
    address: 'Multergasse 11',
    city: 'St. Gallen',
    country: 'Switzerland',
    vatNumber: 'CH-320.4.073.969-4'
  }
];

export function getClients(): Promise<Client[]> {
  return Promise.resolve(storage.read(clientsStorageKey, seededClients));
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

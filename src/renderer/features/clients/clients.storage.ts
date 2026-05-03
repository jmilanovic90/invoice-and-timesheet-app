import type { Client } from '../../../shared/types/client';
import { createId } from '../../lib/utils/id';
import { apiRequest } from '../../lib/api/http';

export async function getClients(): Promise<Client[]> {
  try {
    return await apiRequest<Client[]>('/clients');
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createClient(values: Omit<Client, 'id'>): Promise<Client> {
  return apiRequest<Client>('/clients', {
    method: 'POST',
    body: JSON.stringify({
      ...values,
      id: createId('client')
    })
  });
}

export async function updateClient(values: Client): Promise<Client> {
  return apiRequest<Client>(`/clients/${values.id}`, {
    method: 'PUT',
    body: JSON.stringify(values)
  });
}

export async function deleteClient(clientId: string): Promise<void> {
  await apiRequest<void>(`/clients/${clientId}`, {
    method: 'DELETE'
  });
}

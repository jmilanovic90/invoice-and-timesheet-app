import type { Client } from '../../shared/types/client';
import { supabaseAdmin } from '../lib/supabase-admin';
import { toClient, toClientRow, type ClientRow } from './mappers';

export async function listClients(): Promise<Client[]> {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .select('*')
    .order('name', { ascending: true })
    .returns<ClientRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(toClient);
}

export async function createClientRecord(client: Client): Promise<Client> {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .insert(toClientRow(client))
    .select('*')
    .single<ClientRow>();

  if (error) {
    throw error;
  }

  return toClient(data);
}

export async function updateClientRecord(client: Client): Promise<Client> {
  const { data, error } = await supabaseAdmin
    .from('clients')
    .update(toClientRow(client))
    .eq('id', client.id)
    .select('*')
    .single<ClientRow>();

  if (error) {
    throw error;
  }

  return toClient(data);
}

export async function deleteClientRecord(clientId: string): Promise<void> {
  const { error } = await supabaseAdmin.from('clients').delete().eq('id', clientId);

  if (error) {
    throw error;
  }
}

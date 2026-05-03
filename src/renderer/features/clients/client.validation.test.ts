import assert from 'node:assert/strict';
import type { Client } from '../../../shared/types/client';
import { validateClient } from './client.validation';

const validClient: Client = {
  id: 'client-1',
  name: 'ServiceOcean AG',
  address: 'Multergasse 11',
  city: 'St. Gallen',
  country: 'Switzerland',
  vatNumber: 'CH-320.4.073.969-4'
};

export function runClientValidationTests(): void {
  assert.deepEqual(validateClient(validClient), {});
  assert.deepEqual(
    validateClient({
      ...validClient,
      name: '',
      address: ' '.repeat(5),
      city: '',
      vatNumber: '',
      country: 'X'.repeat(81)
    }),
    {
      name: 'Client name is required.',
      address: 'Address is required.',
      city: 'City is required.',
      country: 'Country must be 80 characters or fewer.',
      vatNumber: 'VAT / tax number is required.'
    }
  );
}

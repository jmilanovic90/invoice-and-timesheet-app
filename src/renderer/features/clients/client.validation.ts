import type { Client } from '../../../shared/types/client';

export interface ClientValidationResult {
  name?: string;
  address?: string;
  city?: string;
  vatNumber?: string;
}

export function validateClient(values: Client): ClientValidationResult {
  const errors: ClientValidationResult = {};

  if (!values.name.trim()) {
    errors.name = 'Client name is required.';
  }

  if (!values.address.trim()) {
    errors.address = 'Address is required.';
  }

  if (!values.city.trim()) {
    errors.city = 'City is required.';
  }

  if (!values.vatNumber.trim()) {
    errors.vatNumber = 'VAT / tax number is required.';
  }

  return errors;
}

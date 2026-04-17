import type { Client } from '../../../shared/types/client';
import { hasMaxLength, hasText } from '../../lib/utils/validation';

export interface ClientValidationResult {
  name?: string;
  address?: string;
  city?: string;
  country?: string;
  vatNumber?: string;
}

export function validateClient(values: Client): ClientValidationResult {
  const errors: ClientValidationResult = {};

  if (!hasText(values.name)) {
    errors.name = 'Client name is required.';
  } else if (!hasMaxLength(values.name, 80)) {
    errors.name = 'Client name must be 80 characters or fewer.';
  }

  if (!hasText(values.address)) {
    errors.address = 'Address is required.';
  } else if (!hasMaxLength(values.address, 160)) {
    errors.address = 'Address must be 160 characters or fewer.';
  }

  if (!hasText(values.city)) {
    errors.city = 'City is required.';
  } else if (!hasMaxLength(values.city, 80)) {
    errors.city = 'City must be 80 characters or fewer.';
  }

  if (values.country && !hasMaxLength(values.country, 80)) {
    errors.country = 'Country must be 80 characters or fewer.';
  }

  if (!hasText(values.vatNumber)) {
    errors.vatNumber = 'VAT / tax number is required.';
  } else if (!hasMaxLength(values.vatNumber, 40)) {
    errors.vatNumber = 'VAT / tax number must be 40 characters or fewer.';
  }

  return errors;
}

import type { Company } from '../../../shared/types/company';
import {
  hasMaxLength,
  hasText,
  isValidEmail,
  isValidIban,
  isValidSwift
} from '../../lib/utils/validation';

export interface CompanyValidationResult {
  name?: string;
  fullName?: string;
  address?: string;
  city?: string;
  country?: string;
  vatNumber?: string;
  registrationId?: string;
  iban1?: string;
  iban2?: string;
  iban3?: string;
  swift?: string;
  email?: string;
}

export function validateCompany(values: Company): CompanyValidationResult {
  const errors: CompanyValidationResult = {};

  if (!hasText(values.name)) {
    errors.name = 'Company name is required.';
  } else if (!hasMaxLength(values.name, 80)) {
    errors.name = 'Company name must be 80 characters or fewer.';
  }

  if (!hasText(values.fullName)) {
    errors.fullName = 'Full legal name is required.';
  } else if (!hasMaxLength(values.fullName, 160)) {
    errors.fullName = 'Full legal name must be 160 characters or fewer.';
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

  if (values.registrationId && !hasMaxLength(values.registrationId, 40)) {
    errors.registrationId = 'Registration number must be 40 characters or fewer.';
  }

  if (values.iban1 && !isValidIban(values.iban1)) {
    errors.iban1 = 'Enter a valid IBAN.';
  }

  if (values.iban2 && !isValidIban(values.iban2)) {
    errors.iban2 = 'Enter a valid IBAN.';
  }

  if (values.iban3 && !isValidIban(values.iban3)) {
    errors.iban3 = 'Enter a valid IBAN.';
  }

  if (values.swift && !isValidSwift(values.swift)) {
    errors.swift = 'Enter a valid SWIFT code.';
  }

  if (values.email && !isValidEmail(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  return errors;
}

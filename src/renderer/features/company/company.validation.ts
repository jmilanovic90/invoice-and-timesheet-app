import type { Company } from '../../../shared/types/company';

export interface CompanyValidationResult {
  name?: string;
  fullName?: string;
  address?: string;
  city?: string;
  vatNumber?: string;
}

export function validateCompany(values: Company): CompanyValidationResult {
  const errors: CompanyValidationResult = {};

  if (!values.name.trim()) {
    errors.name = 'Company name is required.';
  }

  if (!values.fullName.trim()) {
    errors.fullName = 'Full legal name is required.';
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

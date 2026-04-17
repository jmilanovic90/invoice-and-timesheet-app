import type { Company } from '../../../shared/types/company';
import { WebStorage } from '../../lib/storage/web-storage';
import { emptyCompany } from './company.defaults';

const storage = new WebStorage();
const companyStorageKey = 'invoice-app/company-v2';
const legacyCompanyStorageKey = 'invoice-app/company';

function normalizeCompany(values: Company & { iban?: string }): Company {
  const normalized: Company = {
    ...emptyCompany,
    ...values,
    iban1: values.iban1 || values.iban || '',
    iban2: values.iban2 || '',
    iban3: values.iban3 || '',
    logoDataUrl: values.logoDataUrl || ''
  };

  const hasOtherCompanyData = [
    normalized.name,
    normalized.fullName,
    normalized.address,
    normalized.city,
    normalized.vatNumber,
    normalized.registrationId,
    normalized.iban1,
    normalized.iban2,
    normalized.iban3,
    normalized.swift,
    normalized.email,
    normalized.logoDataUrl
  ].some((value) => value.trim().length > 0);

  if (!hasOtherCompanyData && normalized.country === 'Serbia') {
    normalized.country = '';
  }

  return normalized;
}

export function getCompany(): Promise<Company> {
  storage.remove(legacyCompanyStorageKey);
  const stored = storage.read(companyStorageKey, emptyCompany as Company & { iban?: string });
  const normalized = normalizeCompany(stored);

  if (JSON.stringify(stored) !== JSON.stringify(normalized)) {
    storage.write(companyStorageKey, normalized);
  }

  return Promise.resolve(normalized);
}

export function saveCompany(values: Company): Promise<Company> {
  const normalized = normalizeCompany(values);
  return Promise.resolve(storage.write(companyStorageKey, normalized));
}
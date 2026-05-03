import type { Company } from '../../../shared/types/company';
import { apiRequest } from '../../lib/api/http';
import { emptyCompany } from './company.defaults';

export async function getCompany(): Promise<Company> {
  try {
    return await apiRequest<Company>('/company');
  } catch (error) {
    console.error(error);
    return emptyCompany;
  }
}

export function saveCompany(values: Company): Promise<Company> {
  return apiRequest<Company>('/company', {
    method: 'PUT',
    body: JSON.stringify(values)
  });
}

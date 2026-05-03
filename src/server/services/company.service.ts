import type { Company } from '../../shared/types/company';
import { supabaseAdmin } from '../lib/supabase-admin';
import { toCompany, toCompanyRow, type CompanyRow } from './mappers';

export async function readCompany(): Promise<Company> {
  const { data, error } = await supabaseAdmin
    .from('company_profile')
    .select('*')
    .eq('id', 'default')
    .maybeSingle<CompanyRow>();

  if (error) {
    throw error;
  }

  return toCompany(data ?? null);
}

export async function writeCompany(company: Company): Promise<Company> {
  const { data, error } = await supabaseAdmin
    .from('company_profile')
    .upsert(toCompanyRow(company))
    .select('*')
    .single<CompanyRow>();

  if (error) {
    throw error;
  }

  return toCompany(data);
}

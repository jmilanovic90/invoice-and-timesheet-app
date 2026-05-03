import type { Company } from '../../shared/types/company';
import { sendSupabaseError } from '../lib/http';
import { readCompany, writeCompany } from '../services/company.service';

interface ResponseLike {
  status(code: number): ResponseLike;
  json(payload: unknown): void;
}

export async function getCompanyHandler(res: ResponseLike): Promise<void> {
  try {
    const company = await readCompany();
    res.status(200).json(company);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not load company details.');
  }
}

export async function putCompanyHandler(body: unknown, res: ResponseLike): Promise<void> {
  try {
    const company = body as Company;
    const savedCompany = await writeCompany(company);
    res.status(200).json(savedCompany);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not save company details.');
  }
}

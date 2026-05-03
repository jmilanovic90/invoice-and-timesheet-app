import { Router } from 'express';
import type { Company } from '../../shared/types/company';
import { sendSupabaseError } from '../lib/http';
import { readCompany, writeCompany } from '../services/company.service';

export const companyRouter = Router();

companyRouter.get('/', async (_req, res) => {
  try {
    const company = await readCompany();
    res.status(200).json(company);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not load company details.');
  }
});

companyRouter.put('/', async (req, res) => {
  try {
    const company = req.body as Company;
    const savedCompany = await writeCompany(company);
    res.status(200).json(savedCompany);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not save company details.');
  }
});

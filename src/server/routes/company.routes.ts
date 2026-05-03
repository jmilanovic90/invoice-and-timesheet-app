import { Router } from 'express';
import { getCompanyHandler, putCompanyHandler } from '../handlers/company.handlers';

export const companyRouter = Router();

companyRouter.get('/', async (_req, res) => {
  await getCompanyHandler(res);
});

companyRouter.put('/', async (req, res) => {
  await putCompanyHandler(req.body, res);
});

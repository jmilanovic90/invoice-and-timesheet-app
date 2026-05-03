import { Router } from 'express';
import {
  createTimesheetHandler,
  deleteTimesheetHandler,
  getTimesheetHandler,
  listTimesheetsHandler,
  updateTimesheetHandler
} from '../handlers/timesheets.handlers';

export const timesheetsRouter = Router();

timesheetsRouter.get('/', async (_req, res) => {
  await listTimesheetsHandler(res);
});

timesheetsRouter.get('/:id', async (req, res) => {
  await getTimesheetHandler(req.params.id, res);
});

timesheetsRouter.post('/', async (req, res) => {
  await createTimesheetHandler(req.body, res);
});

timesheetsRouter.put('/:id', async (req, res) => {
  await updateTimesheetHandler(req.params.id, req.body, res);
});

timesheetsRouter.delete('/:id', async (req, res) => {
  await deleteTimesheetHandler(req.params.id, res);
});

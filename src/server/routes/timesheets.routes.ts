import { Router } from 'express';
import type { TimesheetDraft } from '../../shared/types/timesheet';
import { sendSupabaseError } from '../lib/http';
import {
  createTimesheetRecord,
  deleteTimesheetRecord,
  listTimesheets,
  readTimesheet,
  updateTimesheetRecord
} from '../services/timesheets.service';

export const timesheetsRouter = Router();

timesheetsRouter.get('/', async (_req, res) => {
  try {
    const timesheets = await listTimesheets();
    res.status(200).json(timesheets);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not load timesheets.');
  }
});

timesheetsRouter.get('/:id', async (req, res) => {
  try {
    const timesheet = await readTimesheet(req.params.id);

    if (!timesheet) {
      res.status(404).json({ error: 'Timesheet not found.' });
      return;
    }

    res.status(200).json(timesheet);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not load timesheet.');
  }
});

timesheetsRouter.post('/', async (req, res) => {
  try {
    const timesheet = await createTimesheetRecord(req.body as TimesheetDraft);
    res.status(201).json(timesheet);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not create timesheet.');
  }
});

timesheetsRouter.put('/:id', async (req, res) => {
  try {
    const timesheet = await updateTimesheetRecord(req.params.id, req.body as TimesheetDraft);

    if (!timesheet) {
      res.status(404).json({ error: 'Timesheet not found.' });
      return;
    }

    res.status(200).json(timesheet);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not update timesheet.');
  }
});

timesheetsRouter.delete('/:id', async (req, res) => {
  try {
    await deleteTimesheetRecord(req.params.id);
    res.status(204).send();
  } catch (error) {
    sendSupabaseError(res, error, 'Could not delete timesheet.');
  }
});

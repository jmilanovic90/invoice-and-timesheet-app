import type { TimesheetDraft } from '../../shared/types/timesheet';
import { sendSupabaseError } from '../lib/http';
import {
  createTimesheetRecord,
  deleteTimesheetRecord,
  listTimesheets,
  readTimesheet,
  updateTimesheetRecord
} from '../services/timesheets.service';

interface ResponseLike {
  status(code: number): ResponseLike;
  json(payload: unknown): void;
  send(payload?: unknown): void;
}

export async function listTimesheetsHandler(res: ResponseLike): Promise<void> {
  try {
    const timesheets = await listTimesheets();
    res.status(200).json(timesheets);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not load timesheets.');
  }
}

export async function getTimesheetHandler(timesheetId: string, res: ResponseLike): Promise<void> {
  try {
    const timesheet = await readTimesheet(timesheetId);

    if (!timesheet) {
      res.status(404).json({ error: 'Timesheet not found.' });
      return;
    }

    res.status(200).json(timesheet);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not load timesheet.');
  }
}

export async function createTimesheetHandler(body: unknown, res: ResponseLike): Promise<void> {
  try {
    const timesheet = await createTimesheetRecord(body as TimesheetDraft);
    res.status(201).json(timesheet);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not create timesheet.');
  }
}

export async function updateTimesheetHandler(timesheetId: string, body: unknown, res: ResponseLike): Promise<void> {
  try {
    const timesheet = await updateTimesheetRecord(timesheetId, body as TimesheetDraft);

    if (!timesheet) {
      res.status(404).json({ error: 'Timesheet not found.' });
      return;
    }

    res.status(200).json(timesheet);
  } catch (error) {
    sendSupabaseError(res, error, 'Could not update timesheet.');
  }
}

export async function deleteTimesheetHandler(timesheetId: string, res: ResponseLike): Promise<void> {
  try {
    await deleteTimesheetRecord(timesheetId);
    res.status(204).send();
  } catch (error) {
    sendSupabaseError(res, error, 'Could not delete timesheet.');
  }
}

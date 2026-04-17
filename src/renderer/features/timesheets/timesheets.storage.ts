import type { Timesheet, TimesheetDraft } from '../../../shared/types/timesheet';
import { WebStorage } from '../../lib/storage/web-storage';
import { createId } from '../../lib/utils/id';
import { calculateTimesheetTotal, normalizeTimesheetDraft } from './timesheet.helpers';

const storage = new WebStorage();
const timesheetsStorageKey = 'invoice-app/timesheets';

function normalizeStoredTimesheet(timesheet: Timesheet): Timesheet {
  return {
    ...timesheet,
    days: timesheet.days.map((day) => ({
      ...day,
      comment: day.comment || ''
    }))
  };
}

export function getTimesheets(): Promise<Timesheet[]> {
  const stored = storage.read(timesheetsStorageKey, [] as Timesheet[]);
  return Promise.resolve(stored.map(normalizeStoredTimesheet));
}

export async function getTimesheetById(timesheetId: string): Promise<Timesheet | null> {
  const timesheets = await getTimesheets();
  return timesheets.find((timesheet) => timesheet.id === timesheetId) ?? null;
}

export async function createTimesheet(draft: TimesheetDraft): Promise<Timesheet> {
  const timesheets = await getTimesheets();
  const normalizedDraft = normalizeTimesheetDraft(draft);

  const nextTimesheet: Timesheet = {
    ...normalizedDraft,
    id: createId('timesheet'),
    totalHours: calculateTimesheetTotal(normalizedDraft.days)
  };

  storage.write(timesheetsStorageKey, [nextTimesheet, ...timesheets]);
  return nextTimesheet;
}

export async function updateTimesheet(timesheetId: string, draft: TimesheetDraft): Promise<Timesheet | null> {
  const timesheets = await getTimesheets();
  const existingTimesheet = timesheets.find((timesheet) => timesheet.id === timesheetId);

  if (!existingTimesheet) {
    return null;
  }

  const normalizedDraft = normalizeTimesheetDraft(draft);

  const nextTimesheet: Timesheet = {
    ...existingTimesheet,
    ...normalizedDraft,
    totalHours: calculateTimesheetTotal(normalizedDraft.days)
  };

  storage.write(
    timesheetsStorageKey,
    timesheets.map((timesheet) => (timesheet.id === timesheetId ? nextTimesheet : timesheet))
  );

  return nextTimesheet;
}

export async function deleteTimesheet(timesheetId: string): Promise<void> {
  const timesheets = await getTimesheets();
  storage.write(
    timesheetsStorageKey,
    timesheets.filter((timesheet) => timesheet.id !== timesheetId)
  );
}

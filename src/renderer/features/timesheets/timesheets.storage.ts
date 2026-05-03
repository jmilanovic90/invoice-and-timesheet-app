import type { Timesheet, TimesheetDraft } from '../../../shared/types/timesheet';
import { apiRequest } from '../../lib/api/http';

export async function getTimesheets(): Promise<Timesheet[]> {
  try {
    return await apiRequest<Timesheet[]>('/timesheets');
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getTimesheetById(timesheetId: string): Promise<Timesheet | null> {
  try {
    return await apiRequest<Timesheet>(`/timesheets/${timesheetId}`);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function createTimesheet(draft: TimesheetDraft): Promise<Timesheet> {
  return apiRequest<Timesheet>('/timesheets', {
    method: 'POST',
    body: JSON.stringify(draft)
  });
}

export async function updateTimesheet(timesheetId: string, draft: TimesheetDraft): Promise<Timesheet | null> {
  return apiRequest<Timesheet>(`/timesheets/${timesheetId}`, {
    method: 'PUT',
    body: JSON.stringify(draft)
  });
}

export async function deleteTimesheet(timesheetId: string): Promise<void> {
  await apiRequest<void>(`/timesheets/${timesheetId}`, {
    method: 'DELETE'
  });
}

import type { Timesheet, TimesheetDraft } from '../../shared/types/timesheet';
import { supabaseAdmin } from '../lib/supabase-admin';
import { createId } from '../../renderer/lib/utils/id';
import { calculateTimesheetTotal, normalizeTimesheetDraft } from '../../renderer/features/timesheets/timesheet.helpers';
import { toTimesheet, toTimesheetRow, type TimesheetRow } from './mappers';

export async function listTimesheets(): Promise<Timesheet[]> {
  const { data, error } = await supabaseAdmin
    .from('timesheets')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .returns<TimesheetRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(toTimesheet);
}

export async function readTimesheet(timesheetId: string): Promise<Timesheet | null> {
  const { data, error } = await supabaseAdmin
    .from('timesheets')
    .select('*')
    .eq('id', timesheetId)
    .maybeSingle<TimesheetRow>();

  if (error) {
    throw error;
  }

  return data ? toTimesheet(data) : null;
}

export async function createTimesheetRecord(draft: TimesheetDraft): Promise<Timesheet> {
  const normalizedDraft = normalizeTimesheetDraft(draft);
  const nextTimesheet: Timesheet = {
    ...normalizedDraft,
    id: createId('timesheet'),
    totalHours: calculateTimesheetTotal(normalizedDraft.days)
  };

  const { data, error } = await supabaseAdmin
    .from('timesheets')
    .insert(toTimesheetRow(nextTimesheet))
    .select('*')
    .single<TimesheetRow>();

  if (error) {
    throw error;
  }

  return toTimesheet(data);
}

export async function updateTimesheetRecord(timesheetId: string, draft: TimesheetDraft): Promise<Timesheet | null> {
  const existingTimesheet = await readTimesheet(timesheetId);

  if (!existingTimesheet) {
    return null;
  }

  const normalizedDraft = normalizeTimesheetDraft(draft);
  const nextTimesheet: Timesheet = {
    ...existingTimesheet,
    ...normalizedDraft,
    totalHours: calculateTimesheetTotal(normalizedDraft.days)
  };

  const { data, error } = await supabaseAdmin
    .from('timesheets')
    .update(toTimesheetRow(nextTimesheet))
    .eq('id', timesheetId)
    .select('*')
    .single<TimesheetRow>();

  if (error) {
    throw error;
  }

  return toTimesheet(data);
}

export async function deleteTimesheetRecord(timesheetId: string): Promise<void> {
  const { error } = await supabaseAdmin.from('timesheets').delete().eq('id', timesheetId);

  if (error) {
    throw error;
  }
}

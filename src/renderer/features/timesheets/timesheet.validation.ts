import type { TimesheetDraft } from '../../../shared/types/timesheet';

export interface TimesheetValidationResult {
  month?: string;
  year?: string;
  targetHoursPerWeek?: string;
}

export function validateTimesheet(draft: TimesheetDraft): TimesheetValidationResult {
  const errors: TimesheetValidationResult = {};

  if (draft.month < 1 || draft.month > 12) {
    errors.month = 'Month is required.';
  }

  if (draft.year < 2000 || draft.year > 2100) {
    errors.year = 'Year is required.';
  }

  if (draft.targetHoursPerWeek <= 0) {
    errors.targetHoursPerWeek = 'Target hours must be greater than zero.';
  }

  return errors;
}

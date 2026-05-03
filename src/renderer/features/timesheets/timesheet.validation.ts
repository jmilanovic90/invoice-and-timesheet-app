import type { TimesheetDraft } from '../../../shared/types/timesheet';
import { hasMaxLength, isIsoDate } from '../../lib/utils/validation';

export interface TimesheetValidationResult {
  month?: string;
  year?: string;
  targetHoursPerWeek?: string;
  submittedDate?: string;
  employeeName?: string;
  projectName?: string;
  days?: string;
}

export function validateTimesheet(draft: TimesheetDraft): TimesheetValidationResult {
  const errors: TimesheetValidationResult = {};

  if (draft.month < 1 || draft.month > 12) {
    errors.month = 'Month is required.';
  }

  if (draft.year < 2000 || draft.year > 2100) {
    errors.year = 'Year is required.';
  }

  if (draft.targetHoursPerWeek <= 0 || draft.targetHoursPerWeek > 168) {
    errors.targetHoursPerWeek = 'Target hours must be between 1 and 168.';
  }

  if (!isIsoDate(draft.submittedDate)) {
    errors.submittedDate = 'Date is required.';
  }

  if (!hasMaxLength(draft.employeeName, 120)) {
    errors.employeeName = 'Employee name must be 120 characters or fewer.';
  }

  if (!hasMaxLength(draft.projectName, 120)) {
    errors.projectName = 'Project name must be 120 characters or fewer.';
  }

  const hasInvalidDay = draft.days.some(
    (day) => !isIsoDate(day.date) || !hasMaxLength(day.comment, 250)
  );

  if (hasInvalidDay) {
    errors.days = 'One or more day rows contain invalid values.';
  }

  return errors;
}

import assert from 'node:assert/strict';
import type { TimesheetDraft } from '../../../shared/types/timesheet';
import { validateTimesheet } from './timesheet.validation';

const validDraft: TimesheetDraft = {
  month: 4,
  year: 2026,
  clientId: '',
  employeeName: '',
  projectName: '',
  targetHoursPerWeek: 40,
  submittedDate: '2026-04-17',
  days: []
};

export function runTimesheetValidationTests(): void {
  assert.deepEqual(validateTimesheet(validDraft), {});
  assert.deepEqual(
    validateTimesheet({
      ...validDraft,
      month: 0,
      year: 2200,
      targetHoursPerWeek: 0
    }),
    {
      month: 'Month is required.',
      year: 'Year is required.',
      targetHoursPerWeek: 'Target hours must be greater than zero.'
    }
  );
}

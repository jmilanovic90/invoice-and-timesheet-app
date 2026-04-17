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
      targetHoursPerWeek: 0,
      submittedDate: '',
      employeeName: 'x'.repeat(121),
      projectName: 'y'.repeat(121),
      days: [
        {
          date: 'bad-date',
          slots: [
            { start: '', end: '' },
            { start: '', end: '' },
            { start: '', end: '' }
          ],
          comment: 'z'.repeat(251),
          totalHours: 0
        }
      ]
    }),
    {
      month: 'Month is required.',
      year: 'Year is required.',
      targetHoursPerWeek: 'Target hours must be between 1 and 168.',
      submittedDate: 'Date is required.',
      employeeName: 'Employee name must be 120 characters or fewer.',
      projectName: 'Project name must be 120 characters or fewer.',
      days: 'One or more day rows contain invalid values.'
    }
  );
}

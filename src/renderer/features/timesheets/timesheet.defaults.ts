import type { Company } from '../../../shared/types/company';
import type { TimesheetDraft, TimesheetSeedConfig } from '../../../shared/types/timesheet';
import { getTodayLocalIsoDate } from '../../lib/utils/date';
import { buildTimesheetDays } from './timesheet.helpers';

export function createDefaultTimesheetDraft(
  seed: TimesheetSeedConfig,
  _company: Company | null
): TimesheetDraft {
  return {
    month: seed.month,
    year: seed.year,
    clientId: seed.clientId,
    employeeName: '',
    projectName: '',
    targetHoursPerWeek: 40,
    submittedDate: getTodayLocalIsoDate(),
    days: buildTimesheetDays(seed.year, seed.month)
  };
}

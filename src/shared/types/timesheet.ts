export interface TimesheetSlot {
  start: string;
  end: string;
}

export interface TimesheetDay {
  date: string;
  slots: TimesheetSlot[];
  comment: string;
  totalHours: number;
}

export interface Timesheet {
  id: string;
  month: number;
  year: number;
  clientId: string;
  employeeName: string;
  projectName: string;
  targetHoursPerWeek: number;
  submittedDate: string;
  days: TimesheetDay[];
  totalHours: number;
}

export type TimesheetDraft = Omit<Timesheet, 'id' | 'totalHours'>;

export interface TimesheetSeedConfig {
  month: number;
  year: number;
  clientId: string;
}

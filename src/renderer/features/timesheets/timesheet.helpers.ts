import type { TimesheetDay, TimesheetDraft, TimesheetSlot } from '../../../shared/types/timesheet';

export const timesheetMonthOptions = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
] as const;

export function createEmptySlot(): TimesheetSlot {
  return {
    start: '',
    end: ''
  };
}

function formatLocalDateParts(year: number, month: number, day: number): string {
  const normalizedMonth = String(month).padStart(2, '0');
  const normalizedDay = String(day).padStart(2, '0');
  return `${year}-${normalizedMonth}-${normalizedDay}`;
}

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function buildTimesheetDays(year: number, month: number): TimesheetDay[] {
  const daysInMonth = new Date(year, month, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    return {
      date: formatLocalDateParts(year, month, index + 1),
      slots: [createEmptySlot(), createEmptySlot(), createEmptySlot()],
      comment: '',
      totalHours: 0
    };
  });
}

export function parseTimeToMinutes(value: string): number | null {
  if (!value) {
    return null;
  }

  const [hours, minutes] = value.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

export function calculateSlotHours(slot: TimesheetSlot): number {
  const start = parseTimeToMinutes(slot.start);
  const end = parseTimeToMinutes(slot.end);

  if (start === null || end === null || end <= start) {
    return 0;
  }

  return Math.round(((end - start) / 60) * 100) / 100;
}

export function calculateDayTotal(day: TimesheetDay): number {
  return Math.round(day.slots.reduce((sum, slot) => sum + calculateSlotHours(slot), 0) * 100) / 100;
}

export function normalizeTimesheetDraft(draft: TimesheetDraft): TimesheetDraft {
  const normalizedDays = draft.days.map((day) => ({
    ...day,
    totalHours: calculateDayTotal(day)
  }));

  return {
    ...draft,
    days: normalizedDays
  };
}

export function calculateTimesheetTotal(days: TimesheetDay[]): number {
  return Math.round(days.reduce((sum, day) => sum + calculateDayTotal(day), 0) * 100) / 100;
}

export function getMonthLabel(month: number): string {
  return timesheetMonthOptions[month - 1] ?? '';
}

export function formatTimesheetDate(value: string): string {
  const date = parseLocalDate(value);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

export function getWeekdayLabel(value: string): string {
  return parseLocalDate(value).toLocaleDateString('en-GB', { weekday: 'long' });
}

export function isWeekend(value: string): boolean {
  const day = parseLocalDate(value).getDay();
  return day === 0 || day === 6;
}

import assert from 'node:assert/strict';
import {
  buildTimesheetDays,
  calculateDayTotal,
  calculateSlotHours,
  calculateTimesheetTotal,
  formatTimesheetDate,
  getMonthLabel,
  isWeekend
} from './timesheet.helpers';

export function runTimesheetHelperTests(): void {
  const monthDays = buildTimesheetDays(2026, 2);
  assert.equal(monthDays.length, 28);
  assert.equal(monthDays[0]?.date, '2026-02-01');
  assert.equal(monthDays[27]?.date, '2026-02-28');

  assert.equal(calculateSlotHours({ start: '09:00', end: '12:30' }), 3.5);
  assert.equal(calculateSlotHours({ start: '12:30', end: '09:00' }), 0);
  assert.equal(calculateSlotHours({ start: '', end: '09:00' }), 0);

  const days = [
    {
      date: '2026-04-01',
      slots: [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '15:00' },
        { start: '', end: '' }
      ],
      comment: '',
      totalHours: 0
    },
    {
      date: '2026-04-02',
      slots: [
        { start: '10:00', end: '11:30' },
        { start: '', end: '' },
        { start: '', end: '' }
      ],
      comment: '',
      totalHours: 0
    }
  ];

  assert.equal(calculateDayTotal(days[0]!), 5);
  assert.equal(calculateTimesheetTotal(days), 6.5);
  assert.equal(getMonthLabel(4), 'April');
  assert.equal(formatTimesheetDate('2026-04-17'), '4/17/2026');
  assert.equal(isWeekend('2026-04-18'), true);
  assert.equal(isWeekend('2026-04-20'), false);
}

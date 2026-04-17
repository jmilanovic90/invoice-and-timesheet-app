import { useState } from 'react';
import type { Client } from '../../../shared/types/client';
import type { Company } from '../../../shared/types/company';
import type { Timesheet } from '../../../shared/types/timesheet';
import {
  calculateDayTotal,
  formatTimesheetDate,
  getMonthLabel,
  getWeekdayLabel,
  isWeekend
} from '../../features/timesheets/timesheet.helpers';

interface TimesheetDocumentProps {
  timesheet: Timesheet;
  company: Company | null;
  client: Client | null;
}

export function TimesheetDocument({ timesheet, company: _company, client }: TimesheetDocumentProps) {
  const [isLogoVisible, setIsLogoVisible] = useState(true);
  const logoSource = _company?.logoDataUrl || '';

  return (
    <section className="timesheet-sheet timesheet-sheet--print" data-print-root="timesheet-document">
      <div className="timesheet-sheet__header">
        <h2>Time Sheet</h2>
        <div className="timesheet-sheet__summary">
          <div className="timesheet-sheet__meta-grid">
            <div className="timesheet-sheet__meta-pair">
              <span>Month:</span>
              <strong>{getMonthLabel(timesheet.month)}</strong>
            </div>
            <div className="timesheet-sheet__meta-pair">
              <span>Year:</span>
              <strong>{timesheet.year}</strong>
            </div>
            <div className="timesheet-sheet__meta-pair">
              <span>Name:</span>
              <strong>{timesheet.employeeName || '-'}</strong>
            </div>
            <div className="timesheet-sheet__meta-pair">
              <span>Client:</span>
              <strong>{client?.name || '-'}</strong>
            </div>
            <div className="timesheet-sheet__meta-pair">
              <span>Project:</span>
              <strong>{timesheet.projectName || '-'}</strong>
            </div>
            <div className="timesheet-sheet__meta-pair">
              <span>Target:</span>
              <strong>{timesheet.targetHoursPerWeek}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="timesheet-table-shell">
        <table className="timesheet-table">
          <thead>
            <tr>
              <th className="timesheet-table__day-head">Day</th>
              <th className="timesheet-table__date-head">Date</th>
              <th className="timesheet-table__time-head">Start</th>
              <th className="timesheet-table__time-head">End</th>
              <th className="timesheet-table__time-head">Start</th>
              <th className="timesheet-table__time-head">End</th>
              <th className="timesheet-table__time-head">Start</th>
              <th className="timesheet-table__time-head">End</th>
              <th className="timesheet-table__total-head">Total Hours</th>
              <th className="timesheet-table__comment-head">Comment</th>
            </tr>
          </thead>
          <tbody>
            {timesheet.days.map((day) => (
              <tr
                key={day.date}
                className={isWeekend(day.date) ? 'timesheet-table__row timesheet-table__row--weekend' : 'timesheet-table__row'}
              >
                <td>{getWeekdayLabel(day.date)}</td>
                <td>{formatTimesheetDate(day.date)}</td>
                {day.slots.flatMap((slot, index) => [
                  <td key={`${day.date}-${index}-start`}>{slot.start || ''}</td>,
                  <td key={`${day.date}-${index}-end`}>{slot.end || ''}</td>
                ])}
                <td className="timesheet-table__total-cell">{calculateDayTotal(day).toFixed(2)}</td>
                <td className="timesheet-table__comment-cell">{day.comment || ''}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={8}>Total</td>
              <td className="timesheet-table__total-cell">{timesheet.totalHours.toFixed(2)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="timesheet-sheet__footer">
        <div className="timesheet-sheet__footer-date">
          <span>Date</span>
          <strong>{timesheet.submittedDate}</strong>
        </div>
        {isLogoVisible && logoSource ? (
          <div className="timesheet-sheet__logo">
            <img
              src={logoSource}
              alt="Stress Test logo"
              onError={() => setIsLogoVisible(false)}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}


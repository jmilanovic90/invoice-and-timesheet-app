import { useEffect, useMemo, useState } from 'react';
import type { Client } from '../../shared/types/client';
import type { Company } from '../../shared/types/company';
import type { TimesheetDraft, TimesheetSeedConfig } from '../../shared/types/timesheet';
import { Button } from '../components/common/Button';
import { SectionCard } from '../components/common/SectionCard';
import { getClients } from '../features/clients/clients.storage';
import { getCompany } from '../features/company/company.storage';
import { createDefaultTimesheetDraft } from '../features/timesheets/timesheet.defaults';
import {
  calculateDayTotal,
  calculateTimesheetTotal,
  formatTimesheetDate,
  getMonthLabel,
  getWeekdayLabel,
  isWeekend
} from '../features/timesheets/timesheet.helpers';
import { createTimesheet, getTimesheetById, updateTimesheet } from '../features/timesheets/timesheets.storage';
import { validateTimesheet } from '../features/timesheets/timesheet.validation';

interface TimesheetEditorPageProps {
  seedConfig: TimesheetSeedConfig | null;
  editingTimesheetId?: string | null;
  onClose: () => void;
}

export function TimesheetEditorPage({
  seedConfig,
  editingTimesheetId = null,
  onClose
}: TimesheetEditorPageProps) {
  const [company, setCompany] = useState<Company | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [draft, setDraft] = useState<TimesheetDraft | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [isLogoVisible, setIsLogoVisible] = useState(true);

  useEffect(() => {
    const loadEditor = async () => {
      const [companyResponse, clientsResponse] = await Promise.all([getCompany(), getClients()]);
      setCompany(companyResponse);
      setClients(clientsResponse);

      if (editingTimesheetId) {
        const existingTimesheet = await getTimesheetById(editingTimesheetId);
        if (existingTimesheet) {
          const { id: _id, totalHours: _totalHours, ...existingDraft } = existingTimesheet;
          setDraft(existingDraft);
          return;
        }
      }

      if (seedConfig) {
        setDraft(createDefaultTimesheetDraft(seedConfig, companyResponse));
      }
    };

    void loadEditor();
  }, [editingTimesheetId, seedConfig]);

  const totalHours = useMemo(() => (draft ? calculateTimesheetTotal(draft.days) : 0), [draft]);
  const logoSource = company?.logoDataUrl || '';

  const updateDraftField = (name: keyof TimesheetDraft, value: string | number) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            [name]: value
          }
        : current
    );
    setValidationMessage('');
    setStatusMessage('');
  };

  const updateDaySlot = (date: string, slotIndex: number, field: 'start' | 'end', value: string) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            days: current.days.map((day) =>
              day.date === date
                ? {
                    ...day,
                    slots: day.slots.map((slot, index) =>
                      index === slotIndex
                        ? {
                            ...slot,
                            [field]: value
                          }
                        : slot
                    )
                  }
                : day
            )
          }
        : current
    );
    setStatusMessage('');
  };

  const updateDayComment = (date: string, value: string) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            days: current.days.map((day) =>
              day.date === date
                ? {
                    ...day,
                    comment: value
                  }
                : day
            )
          }
        : current
    );
    setStatusMessage('');
  };

  if (!draft) {
    return null;
  }

  return (
    <div className="page">
      <div className="page__intro page__intro--wide">
        <div>
          <p className="page__eyebrow">{editingTimesheetId ? 'Edit timesheet' : 'New timesheet'}</p>
          <h1>{editingTimesheetId ? 'Update saved timesheet' : 'Create a monthly timesheet'}</h1>
          <p>
            The sheet is generated from the selected month and year, with daily totals calculated from
            entered time ranges.
          </p>
        </div>
      </div>

      <SectionCard
        title={`${getMonthLabel(draft.month)} ${draft.year}`}
        description="Use up to three work intervals per day. Weekend rows are visually separated and monthly totals update automatically."
        action={
          <div className="inline-actions">
            <Button variant="secondary" onClick={onClose}>
              Back to timesheets
            </Button>
            <Button
              onClick={async () => {
                const validationErrors = validateTimesheet(draft);
                const hasErrors = Object.values(validationErrors).some(Boolean);

                if (hasErrors) {
                  setValidationMessage('Month, year, and target hours must be valid before saving.');
                  return;
                }

                if (editingTimesheetId) {
                  await updateTimesheet(editingTimesheetId, draft);
                  setStatusMessage('Timesheet updated successfully.');
                  onClose();
                  return;
                }

                await createTimesheet(draft);
                setStatusMessage('Timesheet saved successfully.');
                onClose();
              }}
            >
              {editingTimesheetId ? 'Save changes' : 'Save timesheet'}
            </Button>
          </div>
        }
      >
        <div className="timesheet-sheet">
          <div className="timesheet-sheet__header">
            <h2>Time Sheet</h2>
            <div className="timesheet-sheet__summary">
              <div className="timesheet-sheet__meta-grid">
                <div className="timesheet-sheet__meta-pair">
                  <span>Month:</span>
                  <strong>{getMonthLabel(draft.month)}</strong>
                </div>
                <div className="timesheet-sheet__meta-pair">
                  <span>Year:</span>
                  <strong>{draft.year}</strong>
                </div>
                <div className="timesheet-sheet__meta-pair">
                  <span>Employee:</span>
                  <input
                    className="timesheet-sheet__inline-input"
                    value={draft.employeeName}
                    onChange={(event) => updateDraftField('employeeName', event.target.value)}
                  />
                </div>
                <div className="timesheet-sheet__meta-pair">
                  <span>Client:</span>
                  <select
                    className="timesheet-sheet__inline-input"
                    value={draft.clientId}
                    onChange={(event) => updateDraftField('clientId', event.target.value)}
                  >
                    <option value="">No client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="timesheet-sheet__meta-pair">
                  <span>Project:</span>
                  <input
                    className="timesheet-sheet__inline-input"
                    value={draft.projectName}
                    onChange={(event) => updateDraftField('projectName', event.target.value)}
                  />
                </div>
              </div>
              <div className="timesheet-sheet__target">
                <span>Target-hours/Week 100%:</span>
                <input
                  className="timesheet-sheet__target-input"
                  type="number"
                  min="1"
                  value={draft.targetHoursPerWeek}
                  onChange={(event) =>
                    updateDraftField('targetHoursPerWeek', Number(event.target.value) || 0)
                  }
                />
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
                {draft.days.map((day) => (
                  <tr
                    key={day.date}
                    className={
                      isWeekend(day.date)
                        ? 'timesheet-table__row timesheet-table__row--weekend'
                        : 'timesheet-table__row'
                    }
                  >
                    <td>{getWeekdayLabel(day.date)}</td>
                    <td>{formatTimesheetDate(day.date)}</td>
                    {day.slots.flatMap((slot, index) => [
                      <td key={`${day.date}-${index}-start`} className="timesheet-table__slot-cell">
                        <input
                          className="timesheet-table__time-input"
                          type="time"
                          value={slot.start}
                          onChange={(event) => updateDaySlot(day.date, index, 'start', event.target.value)}
                        />
                      </td>,
                      <td key={`${day.date}-${index}-end`} className="timesheet-table__slot-cell">
                        <input
                          className="timesheet-table__time-input"
                          type="time"
                          value={slot.end}
                          onChange={(event) => updateDaySlot(day.date, index, 'end', event.target.value)}
                        />
                      </td>
                    ])}
                    <td className="timesheet-table__total-cell">{calculateDayTotal(day).toFixed(2)}</td>
                    <td className="timesheet-table__comment-cell">
                      <input
                        className="timesheet-table__comment-input"
                        type="text"
                        value={day.comment}
                        onChange={(event) => updateDayComment(day.date, event.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={8}>Total</td>
                  <td className="timesheet-table__total-cell">{totalHours.toFixed(2)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="timesheet-sheet__footer">
            <div className="timesheet-sheet__footer-date">
              <span>Date</span>
              <input
                className="timesheet-sheet__inline-input"
                type="date"
                value={draft.submittedDate}
                onChange={(event) => updateDraftField('submittedDate', event.target.value)}
              />
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

          {validationMessage ? <div className="input-field__error">{validationMessage}</div> : null}
          {statusMessage ? <div className="form-actions__status">{statusMessage}</div> : null}
        </div>
      </SectionCard>
    </div>
  );
}

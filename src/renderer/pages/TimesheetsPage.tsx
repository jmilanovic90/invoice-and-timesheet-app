import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Client } from '../../shared/types/client';
import type { Company } from '../../shared/types/company';
import type { TimesheetSeedConfig, Timesheet } from '../../shared/types/timesheet';
import { Button } from '../components/common/Button';
import { Pagination } from '../components/common/Pagination';
import { SectionCard } from '../components/common/SectionCard';
import { TimesheetDocument } from '../components/timesheets/TimesheetDocument';
import { getClients } from '../features/clients/clients.storage';
import { getCompany } from '../features/company/company.storage';
import {
  deleteTimesheet,
  getTimesheets
} from '../features/timesheets/timesheets.storage';
import { getMonthLabel } from '../features/timesheets/timesheet.helpers';
import { printTimesheetDocument } from '../lib/print/print-timesheet';

interface TimesheetsPageProps {
  onCreateTimesheet: (seed: TimesheetSeedConfig) => void;
  onEditTimesheet: (timesheetId: string) => void;
}

type YearSortDirection = 'asc' | 'desc';

function buildYearOptions(timesheets: Timesheet[]): number[] {
  const currentYear = new Date().getFullYear();
  const years = new Set<number>([currentYear, currentYear - 1, currentYear + 1]);
  timesheets.forEach((timesheet) => years.add(timesheet.year));
  return Array.from(years).sort((left, right) => right - left);
}

export function TimesheetsPage({ onCreateTimesheet, onEditTimesheet }: TimesheetsPageProps) {
  const pageSize = 12;
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [yearSort, setYearSort] = useState<YearSortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [seedConfig, setSeedConfig] = useState<TimesheetSeedConfig>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    clientId: ''
  });
  const [seedError, setSeedError] = useState('');

  const loadData = async () => {
    const [timesheetsResponse, clientsResponse, companyResponse] = await Promise.all([
      getTimesheets(),
      getClients(),
      getCompany()
    ]);
    setTimesheets(
      [...timesheetsResponse].sort((left, right) => {
        if (left.year !== right.year) {
          return right.year - left.year;
        }

        return right.month - left.month;
      })
    );
    setClients(clientsResponse);
    setCompany(companyResponse);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const yearOptions = useMemo(() => buildYearOptions(timesheets), [timesheets]);
  const sortedTimesheets = useMemo(
    () =>
      [...timesheets].sort((left, right) => {
        if (left.year !== right.year) {
          return yearSort === 'desc' ? right.year - left.year : left.year - right.year;
        }

        return right.month - left.month;
      }),
    [timesheets, yearSort]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [yearSort]);

  const totalPages = Math.max(1, Math.ceil(sortedTimesheets.length / pageSize));

  useEffect(() => {
    setCurrentPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginatedTimesheets = useMemo(
    () => sortedTimesheets.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, sortedTimesheets]
  );

  const getClientName = (clientId: string) =>
    clients.find((client) => client.id === clientId)?.name ?? '—';

  return (
    <div className="page">
      <div className="page__intro">
        <div className="page__intro-content">
          <p className="page__eyebrow">Timesheets</p>
          <div className="page__intro-title-row">
            <h1>Timesheets</h1>
            <div className="page__intro-actions">
              <Button
                className="button--hero"
                onClick={() => {
                  setSeedConfig({
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear(),
                    clientId: ''
                  });
                  setSeedError('');
                  setIsDialogOpen(true);
                }}
              >
                New timesheet
              </Button>
            </div>
          </div>
          <p>
            Track monthly working time per client with daily hour rows, automatic totals, and a
            printable sheet layout.
          </p>
        </div>
      </div>

      <SectionCard
        title="Timesheets"
        description="Create monthly timesheets and reopen them later."
      >
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>
                  <button
                    className="table-sort"
                    type="button"
                    onClick={() =>
                      setYearSort((current) => (current === 'desc' ? 'asc' : 'desc'))
                    }
                  >
                    <span>Year</span>
                    <span className="table-sort__chevron" aria-hidden="true">
                      {yearSort === 'asc' ? '▴' : '▾'}
                    </span>
                  </button>
                </th>
                <th>Client</th>
                <th>Total hours</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTimesheets.map((timesheet) => (
                <tr key={timesheet.id}>
                  <td>{getMonthLabel(timesheet.month)}</td>
                  <td>{timesheet.year}</td>
                  <td>{getClientName(timesheet.clientId)}</td>
                  <td>{timesheet.totalHours.toFixed(2)}</td>
                  <td>
                    <div className="inline-actions">
                      <Button variant="secondary" onClick={() => onEditTimesheet(timesheet.id)}>
                        Open
                      </Button>
                      <Button variant="secondary" onClick={() => onEditTimesheet(timesheet.id)}>
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const selectedClient =
                            clients.find((client) => client.id === timesheet.clientId) ?? null;
                          const container = document.createElement('div');
                          container.style.position = 'fixed';
                          container.style.left = '-9999px';
                          document.body.appendChild(container);
                          const root = createRoot(container);
                          root.render(
                            <TimesheetDocument
                              timesheet={timesheet}
                              company={company}
                              client={selectedClient}
                            />
                          );
                          requestAnimationFrame(() => {
                            const printableRoot = container.querySelector(
                              '[data-print-root="timesheet-document"]'
                            );
                            if (printableRoot instanceof HTMLElement) {
                              void printTimesheetDocument(
                                printableRoot,
                                `${getMonthLabel(timesheet.month)}-${timesheet.year}`
                              );
                            }
                            setTimeout(() => {
                              root.unmount();
                              container.remove();
                            }, 300);
                          });
                        }}
                      >
                        Download PDF
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          await deleteTimesheet(timesheet.id);
                          await loadData();
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={sortedTimesheets.length}
          onPageChange={setCurrentPage}
        />
      </SectionCard>

      {isDialogOpen ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card" role="dialog" aria-modal="true" aria-label="Create timesheet">
            <div className="modal-card__header">
              <div>
                <h3>New timesheet</h3>
                <p>Select the month, year, and optionally a client before opening the sheet.</p>
              </div>
            </div>
            <div className="modal-card__body">
              <div className="form-grid">
                <label className="input-field">
                  <span className="input-field__label">Month</span>
                  <select
                    className="input-field__control"
                    value={seedConfig.month}
                    onChange={(event) =>
                      setSeedConfig((current) => ({
                        ...current,
                        month: Number(event.target.value)
                      }))
                    }
                  >
                    {Array.from({ length: 12 }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {getMonthLabel(index + 1)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="input-field">
                  <span className="input-field__label">Year</span>
                  <select
                    className="input-field__control"
                    value={seedConfig.year}
                    onChange={(event) =>
                      setSeedConfig((current) => ({
                        ...current,
                        year: Number(event.target.value)
                      }))
                    }
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="input-field input-field--full">
                  <span className="input-field__label">Client</span>
                  <select
                    className="input-field__control"
                    value={seedConfig.clientId}
                    onChange={(event) =>
                      setSeedConfig((current) => ({
                        ...current,
                        clientId: event.target.value
                      }))
                    }
                  >
                    <option value="">No client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {seedError ? <div className="input-field__error">{seedError}</div> : null}
            </div>
            <div className="modal-card__footer">
              <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!seedConfig.month || !seedConfig.year) {
                    setSeedError('Month and year are required.');
                    return;
                  }

                  setIsDialogOpen(false);
                  onCreateTimesheet(seedConfig);
                }}
              >
                Open timesheet
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

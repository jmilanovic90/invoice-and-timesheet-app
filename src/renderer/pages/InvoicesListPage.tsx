import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  totalYearAmountCurrencies,
  type CurrencyCode,
  type TotalYearAmountCurrencyCode
} from '../../shared/types/currency';
import type { Invoice } from '../../shared/types/invoice';
import type { Client } from '../../shared/types/client';
import type { Company } from '../../shared/types/company';
import { Button } from '../components/common/Button';
import { Pagination } from '../components/common/Pagination';
import { SectionCard } from '../components/common/SectionCard';
import { InvoiceDocument } from '../components/invoices/InvoiceDocument';
import { getClients } from '../features/clients/clients.storage';
import { getCompany } from '../features/company/company.storage';
import { convertInvoiceAmountToCurrency } from '../features/invoices/nbs-exchange-rate.service';
import { deleteInvoice, getInvoices } from '../features/invoices/invoices.storage';
import { formatCurrency } from '../lib/formatters/currency';
import { formatDate } from '../lib/formatters/date';
import { printInvoiceDocument } from '../lib/print/print-invoice';

interface InvoicesListPageProps {
  onCreateInvoice: () => void;
  onOpenInvoice: (invoiceId: string) => void;
  onEditInvoice: (invoiceId: string) => void;
}

type SortDirection = 'off' | 'asc' | 'desc';

function getNextSortDirection(current: SortDirection): SortDirection {
  if (current === 'off') {
    return 'asc';
  }

  if (current === 'asc') {
    return 'desc';
  }

  return 'off';
}

export function InvoicesListPage({ onCreateInvoice, onOpenInvoice, onEditInvoice }: InvoicesListPageProps) {
  const pageSize = 12;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const [selectedCurrency, setSelectedCurrency] = useState<string>('All');
  const [activeSortField, setActiveSortField] = useState<'client' | 'invoiceDate'>('invoiceDate');
  const [clientSort, setClientSort] = useState<SortDirection>('off');
  const [invoiceDateSort, setInvoiceDateSort] = useState<SortDirection>('desc');
  const [selectedYearTotalCurrency, setSelectedYearTotalCurrency] =
    useState<TotalYearAmountCurrencyCode>('RSD');
  const [totalYearAmount, setTotalYearAmount] = useState(0);
  const totalYearAmountRsd = totalYearAmount;
  const [isTotalLoading, setIsTotalLoading] = useState(false);
  const [yearTotalStatus, setYearTotalStatus] = useState('');
  const [hasRateError, setHasRateError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadInvoices = async () => {
    void Promise.all([getInvoices(), getClients(), getCompany()]).then(
      ([invoiceResponse, clientResponse, companyResponse]) => {
        setInvoices(
          [...invoiceResponse].sort(
            (left, right) =>
              new Date(right.invoiceDate).getTime() - new Date(left.invoiceDate).getTime()
          )
        );
        setClients(clientResponse);
        setCompany(companyResponse);
      }
    );
  };

  useEffect(() => {
    void loadInvoices();
  }, []);

  const getClientName = (clientId: string) =>
    clients.find((client) => client.id === clientId)?.name ?? 'Unknown client';

  const invoiceYears = useMemo(
    () =>
      Array.from(
        new Set(
          invoices.map((invoice) => new Date(invoice.invoiceDate).getFullYear()).filter((year) => Number.isFinite(year))
        )
      )
        .sort((left, right) => right - left)
        .map(String),
    [invoices]
  );

  const yearFilteredInvoices = useMemo(
    () =>
      selectedYear === 'All'
        ? invoices
        : invoices.filter(
            (invoice) => String(new Date(invoice.invoiceDate).getFullYear()) === selectedYear
          ),
    [invoices, selectedYear]
  );

  const yearCurrencyOptions = useMemo(
    () =>
      Array.from(new Set(yearFilteredInvoices.map((invoice) => invoice.currency)))
        .sort()
        .map((currency) => currency as CurrencyCode),
    [yearFilteredInvoices]
  );

  const currencyFilteredInvoices = useMemo(
    () =>
      selectedCurrency === 'All'
        ? yearFilteredInvoices
        : yearFilteredInvoices.filter((invoice) => invoice.currency === selectedCurrency),
    [selectedCurrency, yearFilteredInvoices]
  );

  const sortedInvoices = useMemo(() => {
    const compareDirection = (direction: SortDirection, comparison: number) => {
      if (direction === 'off' || comparison === 0) {
        return 0;
      }

      return direction === 'asc' ? comparison : -comparison;
    };

    return [...currencyFilteredInvoices].sort((left, right) => {
      if (activeSortField === 'client') {
        return compareDirection(
          clientSort,
          getClientName(left.clientId).localeCompare(getClientName(right.clientId), 'en', {
            sensitivity: 'base'
          })
        );
      }

      return compareDirection(
        invoiceDateSort,
        new Date(left.invoiceDate).getTime() - new Date(right.invoiceDate).getTime()
      );
    });
  }, [activeSortField, clientSort, currencyFilteredInvoices, invoiceDateSort, clients]);

  const totalsByInvoiceCurrency = useMemo(
    () =>
      yearCurrencyOptions.map((currency) => ({
        currency,
        amount: yearFilteredInvoices
          .filter((invoice) => invoice.currency === currency)
          .reduce((sum, invoice) => sum + invoice.grandTotal, 0)
      })),
    [yearCurrencyOptions, yearFilteredInvoices]
  );

  useEffect(() => {
    if (!invoiceYears.length) {
      setSelectedYear('All');
      return;
    }

    const currentYear = String(new Date().getFullYear());
    setSelectedYear((current) => {
      if (invoiceYears.includes(currentYear)) {
        return currentYear;
      }

      if (current === 'All') {
        return current;
      }

      if (invoiceYears.includes(current)) {
        return current;
      }

      return invoiceYears[0];
    });
  }, [invoiceYears]);

  useEffect(() => {
    setSelectedCurrency((current) =>
      current === 'All' || yearCurrencyOptions.includes(current as CurrencyCode) ? current : 'All'
    );
  }, [yearCurrencyOptions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, selectedCurrency, activeSortField, clientSort, invoiceDateSort]);

  const totalPages = Math.max(1, Math.ceil(sortedInvoices.length / pageSize));

  useEffect(() => {
    setCurrentPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginatedInvoices = useMemo(
    () => sortedInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, sortedInvoices]
  );

  useEffect(() => {
    let cancelled = false;

    const calculateYearTotal = async () => {
      if (!yearFilteredInvoices.length) {
        setTotalYearAmount(0);
        setHasRateError(false);
        setYearTotalStatus(
          invoices.length
            ? 'No invoices found for the selected filter.'
            : 'Add invoices to start calculating yearly RSD totals.'
        );
        return;
      }

      setIsTotalLoading(true);
      setHasRateError(false);
      setYearTotalStatus('Calculating with official NBS middle rates by invoice date.');

      try {
        const convertedValues = await Promise.all(
          yearFilteredInvoices.map((invoice) =>
            convertInvoiceAmountToCurrency(
              invoice.grandTotal,
              invoice.currency,
              selectedYearTotalCurrency as CurrencyCode,
              invoice.invoiceDate
            )
          )
        );

        if (cancelled) {
          return;
        }

        const nextTotal = convertedValues.reduce((sum, value) => sum + value, 0);
        setTotalYearAmount(nextTotal);
        setYearTotalStatus(
          `Calculated from official NBS middle-rate lists for each invoice date in ${selectedYearTotalCurrency}.`
        );
      } catch {
        if (cancelled) {
          return;
        }

        setTotalYearAmount(0);
        setHasRateError(true);
        setYearTotalStatus(
          'Could not load official NBS rates right now. Please check your internet connection and try again.'
        );
      } finally {
        if (!cancelled) {
          setIsTotalLoading(false);
        }
      }
    };

    void calculateYearTotal();

    return () => {
      cancelled = true;
    };
  }, [yearFilteredInvoices, invoices.length, selectedYearTotalCurrency]);

  return (
    <div className="page">
      <div className="page__intro">
        <div className="page__intro-content">
          <p className="page__eyebrow">Invoices</p>
          <div className="page__intro-title-row">
            <h1>Invoices</h1>
            <div className="page__intro-actions">
              <Button className="button--hero" onClick={onCreateInvoice}>
                New invoice
              </Button>
            </div>
          </div>
          <p>
            Every invoice saved from the editor appears here with its client, date, trading place,
            and total amount.
          </p>
        </div>
      </div>

      <SectionCard
        title="Overview"
        description="Year changes the invoice list and both totals. Currency filter changes only the list and Total Amount in Currency."
        action={
          <div className="invoice-filters">
            <label className="invoice-year-filter">
              <span className="invoice-year-filter__label">Year</span>
              <select
                className="input-field__control"
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
                disabled={!invoiceYears.length}
              >
                <option value="All">All</option>
                {invoiceYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label className="invoice-year-filter">
              <span className="invoice-year-filter__label">Currency</span>
              <select
                className="input-field__control"
                value={selectedCurrency}
                onChange={(event) => setSelectedCurrency(event.target.value)}
              >
                <option value="All">All</option>
                {yearCurrencyOptions.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </label>
          </div>
        }
      >
        <div className="kpi-grid">
          <article className={hasRateError ? 'kpi-card kpi-card--error' : 'kpi-card'}>
            <span className="kpi-card__label">Total Year Amount</span>
            <strong>{isTotalLoading ? 'Loading…' : formatCurrency(totalYearAmountRsd, 'RSD')}</strong>
            <div className="kpi-card__amount-row">
              <strong className="kpi-card__value--active">
                {isTotalLoading ? 'Loading...' : formatCurrency(totalYearAmount, selectedYearTotalCurrency)}
              </strong>
              <div className="kpi-card__currency-select">
                <select
                  className="kpi-card__currency-control"
                  value={selectedYearTotalCurrency}
                  onChange={(event) =>
                    setSelectedYearTotalCurrency(event.target.value as TotalYearAmountCurrencyCode)
                  }
                >
                  {totalYearAmountCurrencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p>{yearTotalStatus}</p>
          </article>
          <article className="kpi-card">
            <span className="kpi-card__label">Selected Year</span>
            <strong>{selectedYear}</strong>
            <p>{currencyFilteredInvoices.length} invoices included after filters.</p>
          </article>
          <article className="kpi-card">
            <span className="kpi-card__label">Currency Filter</span>
            <strong>{selectedCurrency}</strong>
            <p>Impacts the invoice list and Total Amount in Currency only.</p>
          </article>
        </div>
        <div className="currency-totals-card">
          <div className="currency-totals-card__header">
            <h3>Total Amount in Currency</h3>
            <p>
              {selectedCurrency === 'All'
                ? 'Showing one total for each invoice currency present after the year filter.'
                : `Showing the summed total in ${selectedCurrency} after the year and currency filters.`}
            </p>
          </div>
          <div className="currency-totals-list">
            {selectedCurrency === 'All'
              ? totalsByInvoiceCurrency.map((entry) => (
                  <div key={entry.currency} className="currency-total-item">
                    <span>{entry.currency}</span>
                    <strong>{formatCurrency(entry.amount, entry.currency)}</strong>
                  </div>
                ))
              : (
                <div className="currency-total-item">
                  <span>{selectedCurrency}</span>
                  <strong>
                    {formatCurrency(
                      currencyFilteredInvoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0),
                      selectedCurrency as CurrencyCode
                    )}
                  </strong>
                </div>
              )}
          </div>
        </div>
        {hasRateError ? (
          <div className="invoice-year-error">
            NBS exchange rates could not be loaded. The converted yearly total is temporarily unavailable.
          </div>
        ) : null}
      </SectionCard>

      <SectionCard title="Invoice list">
        <div className="table-shell">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice no.</th>
                <th>
                  <button
                    className="table-sort"
                    type="button"
                    onClick={() => {
                      setActiveSortField('client');
                      setClientSort((current) => getNextSortDirection(current));
                      setInvoiceDateSort('off');
                    }}
                  >
                    <span>Client</span>
                    <span className="table-sort__chevron" aria-hidden="true">
                      {activeSortField === 'client' && clientSort === 'asc'
                        ? '▴'
                        : activeSortField === 'client' && clientSort === 'desc'
                          ? '▾'
                          : '▿'}
                    </span>
                  </button>
                </th>
                <th>
                  <button
                    className="table-sort"
                    type="button"
                    onClick={() => {
                      setActiveSortField('invoiceDate');
                      setInvoiceDateSort((current) => getNextSortDirection(current));
                      setClientSort('off');
                    }}
                  >
                    <span>Invoice date</span>
                    <span className="table-sort__chevron" aria-hidden="true">
                      {activeSortField === 'invoiceDate' && invoiceDateSort === 'asc'
                        ? '▴'
                        : activeSortField === 'invoiceDate' && invoiceDateSort === 'desc'
                          ? '▾'
                          : '▿'}
                    </span>
                  </button>
                </th>
                <th>Trading place</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{getClientName(invoice.clientId)}</td>
                  <td>{formatDate(invoice.invoiceDate)}</td>
                  <td>{invoice.tradingPlace}</td>
                  <td>{formatCurrency(invoice.grandTotal, invoice.currency)}</td>
                  <td>
                    <div className="inline-actions">
                      <Button variant="secondary" onClick={() => onOpenInvoice(invoice.id)}>
                        Open
                      </Button>
                      <Button variant="secondary" onClick={() => onEditInvoice(invoice.id)}>
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const selectedClient =
                            clients.find((client) => client.id === invoice.clientId) ?? null;
                          const container = document.createElement('div');
                          container.style.position = 'fixed';
                          container.style.left = '-9999px';
                          document.body.appendChild(container);
                          const root = createRoot(container);
                          root.render(
                            <InvoiceDocument
                              invoice={invoice}
                              company={company}
                              client={selectedClient}
                            />
                          );
                          requestAnimationFrame(() => {
                            const printableRoot = container.querySelector(
                              '[data-print-root="invoice-document"]'
                            );
                            if (printableRoot instanceof HTMLElement) {
                              void printInvoiceDocument(printableRoot, invoice.invoiceNumber);
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
                          await deleteInvoice(invoice.id);
                          await loadInvoices();
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
          totalItems={sortedInvoices.length}
          onPageChange={setCurrentPage}
        />
      </SectionCard>
    </div>
  );
}

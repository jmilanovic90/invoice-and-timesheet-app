import type { Company } from '../../shared/types/company';
import type { Client } from '../../shared/types/client';
import type { Invoice, InvoiceItem } from '../../shared/types/invoice';
import type { Timesheet, TimesheetDay } from '../../shared/types/timesheet';
import { emptyCompany } from '../../renderer/features/company/company.defaults';

export interface CompanyRow {
  id: string;
  name: string;
  full_name: string;
  address: string;
  city: string;
  country: string;
  vat_number: string;
  registration_id: string;
  iban_1: string;
  iban_2: string;
  iban_3: string;
  swift: string;
  email: string;
  logo_data_url: string;
}

export interface ClientRow {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  vat_number: string;
}

export interface InvoiceRow {
  id: string;
  invoice_number: string;
  invoice_date: string;
  trading_date: string;
  trading_place: string;
  client_id: string;
  issuer_iban: string;
  currency: Invoice['currency'];
  notes: string;
  tax_note: string;
  payment_deadline_days: number;
  items: InvoiceItem[];
  subtotal: number;
  discount_total: number;
  grand_total: number;
}

export interface TimesheetRow {
  id: string;
  month: number;
  year: number;
  client_id: string;
  employee_name: string;
  project_name: string;
  target_hours_per_week: number;
  submitted_date: string;
  days: TimesheetDay[];
  total_hours: number;
}

export function toCompany(row: CompanyRow | null): Company {
  if (!row) {
    return emptyCompany;
  }

  return {
    name: row.name,
    fullName: row.full_name,
    address: row.address,
    city: row.city,
    country: row.country,
    vatNumber: row.vat_number,
    registrationId: row.registration_id,
    iban1: row.iban_1,
    iban2: row.iban_2,
    iban3: row.iban_3,
    swift: row.swift,
    email: row.email,
    logoDataUrl: row.logo_data_url
  };
}

export function toCompanyRow(company: Company): CompanyRow {
  return {
    id: 'default',
    name: company.name,
    full_name: company.fullName,
    address: company.address,
    city: company.city,
    country: company.country,
    vat_number: company.vatNumber,
    registration_id: company.registrationId,
    iban_1: company.iban1,
    iban_2: company.iban2,
    iban_3: company.iban3,
    swift: company.swift,
    email: company.email,
    logo_data_url: company.logoDataUrl
  };
}

export function toClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    country: row.country,
    vatNumber: row.vat_number
  };
}

export function toClientRow(client: Client): ClientRow {
  return {
    id: client.id,
    name: client.name,
    address: client.address,
    city: client.city,
    country: client.country,
    vat_number: client.vatNumber
  };
}

export function toInvoice(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    invoiceDate: row.invoice_date,
    tradingDate: row.trading_date,
    tradingPlace: row.trading_place,
    clientId: row.client_id,
    issuerIban: row.issuer_iban,
    currency: row.currency,
    notes: row.notes,
    taxNote: row.tax_note,
    paymentDeadlineDays: row.payment_deadline_days,
    items: row.items,
    subtotal: Number(row.subtotal),
    discountTotal: Number(row.discount_total),
    grandTotal: Number(row.grand_total)
  };
}

export function toInvoiceRow(invoice: Invoice): InvoiceRow {
  return {
    id: invoice.id,
    invoice_number: invoice.invoiceNumber,
    invoice_date: invoice.invoiceDate,
    trading_date: invoice.tradingDate,
    trading_place: invoice.tradingPlace,
    client_id: invoice.clientId,
    issuer_iban: invoice.issuerIban,
    currency: invoice.currency,
    notes: invoice.notes,
    tax_note: invoice.taxNote,
    payment_deadline_days: invoice.paymentDeadlineDays,
    items: invoice.items,
    subtotal: invoice.subtotal,
    discount_total: invoice.discountTotal,
    grand_total: invoice.grandTotal
  };
}

export function toTimesheet(row: TimesheetRow): Timesheet {
  return {
    id: row.id,
    month: row.month,
    year: row.year,
    clientId: row.client_id,
    employeeName: row.employee_name,
    projectName: row.project_name,
    targetHoursPerWeek: row.target_hours_per_week,
    submittedDate: row.submitted_date,
    days: row.days,
    totalHours: Number(row.total_hours)
  };
}

export function toTimesheetRow(timesheet: Timesheet): TimesheetRow {
  return {
    id: timesheet.id,
    month: timesheet.month,
    year: timesheet.year,
    client_id: timesheet.clientId,
    employee_name: timesheet.employeeName,
    project_name: timesheet.projectName,
    target_hours_per_week: timesheet.targetHoursPerWeek,
    submitted_date: timesheet.submittedDate,
    days: timesheet.days,
    total_hours: timesheet.totalHours
  };
}

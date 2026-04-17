import type { Invoice } from '../../../shared/types/invoice';

export function generateInvoiceNumber(invoices: Invoice[], invoiceDate: string): string {
  const year = new Date(invoiceDate).getFullYear();
  const usedNumbers = invoices
    .map((invoice) => invoice.invoiceNumber)
    .filter((invoiceNumber) => invoiceNumber.endsWith(`/${year}`))
    .map((invoiceNumber) => Number.parseInt(invoiceNumber.split('/')[0] ?? '0', 10))
    .filter((value) => Number.isFinite(value));

  const nextNumber = (Math.max(0, ...usedNumbers) || 0) + 1;
  return `${nextNumber}/${year}`;
}

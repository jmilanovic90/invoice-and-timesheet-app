import type { Invoice, InvoiceDraft } from '../../../shared/types/invoice';
import { apiRequest } from '../../lib/api/http';

export async function getInvoices(): Promise<Invoice[]> {
  try {
    return await apiRequest<Invoice[]>('/invoices');
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
  try {
    return await apiRequest<Invoice>(`/invoices/${invoiceId}`);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function createInvoice(draft: InvoiceDraft): Promise<Invoice> {
  return apiRequest<Invoice>('/invoices', {
    method: 'POST',
    body: JSON.stringify(draft)
  });
}

export async function updateInvoice(invoiceId: string, draft: InvoiceDraft): Promise<Invoice | null> {
  return apiRequest<Invoice>(`/invoices/${invoiceId}`, {
    method: 'PUT',
    body: JSON.stringify(draft)
  });
}

export async function deleteInvoice(invoiceId: string): Promise<void> {
  await apiRequest<void>(`/invoices/${invoiceId}`, {
    method: 'DELETE'
  });
}

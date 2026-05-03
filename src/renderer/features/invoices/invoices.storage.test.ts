import assert from 'node:assert/strict';
import type { Invoice, InvoiceDraft } from '../../../shared/types/invoice';
import { getTodayLocalIsoDate } from '../../lib/utils/date';
import {
  createInvoice,
  deleteInvoice,
  getInvoiceById,
  getInvoices,
  updateInvoice
} from './invoices.storage';

type FetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

function createFetchResponse(payload: unknown, status = 200): FetchResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload
  };
}

function createDraft(): InvoiceDraft {
  const today = getTodayLocalIsoDate();

  return {
    invoiceDate: today,
    tradingDate: today,
    tradingPlace: 'Novi Sad',
    clientId: 'client-1',
    issuerIban: 'RS351234',
    currency: 'EUR',
    notes: 'Payment deadline is 15 days.',
    taxNote: 'Not in the VAT system.',
    paymentDeadlineDays: 15,
    items: [
      {
        id: 'item-1',
        description: 'Service',
        unit: 'hour',
        quantity: 2,
        price: 50,
        discount: 0,
        total: 0
      }
    ]
  };
}

function createInvoiceRecord(id: string, grandTotal: number): Invoice {
  const draft = createDraft();

  return {
    ...draft,
    id,
    invoiceNumber: `1/${new Date(draft.invoiceDate).getFullYear()}`,
    subtotal: grandTotal,
    discountTotal: 0,
    grandTotal
  };
}

export async function runInvoicesStorageTests(): Promise<void> {
  const globalScope = globalThis as typeof globalThis & { fetch?: typeof fetch };
  const originalFetch = globalScope.fetch;
  const invoice = createInvoiceRecord('invoice-1', 100);
  const updatedInvoice = createInvoiceRecord('invoice-1', 180);

  const calls: Array<{ url: string; method: string }> = [];
  globalScope.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? 'GET';
    calls.push({ url, method });

    if (url.endsWith('/invoices') && method === 'GET') {
      return createFetchResponse([invoice]) as unknown as Response;
    }

    if (url.endsWith('/invoices/invoice-1') && method === 'GET') {
      return createFetchResponse(invoice) as unknown as Response;
    }

    if (url.endsWith('/invoices') && method === 'POST') {
      return createFetchResponse(invoice, 201) as unknown as Response;
    }

    if (url.endsWith('/invoices/invoice-1') && method === 'PUT') {
      return createFetchResponse(updatedInvoice) as unknown as Response;
    }

    if (url.endsWith('/invoices/invoice-1') && method === 'DELETE') {
      return createFetchResponse(null, 204) as unknown as Response;
    }

    return createFetchResponse({ error: 'Not found' }, 404) as unknown as Response;
  }) as typeof fetch;

  try {
    assert.equal((await getInvoices()).length, 1);
    assert.equal((await getInvoiceById('invoice-1'))?.id, 'invoice-1');
    assert.equal((await createInvoice(createDraft())).grandTotal, 100);
    assert.equal((await updateInvoice('invoice-1', createDraft()))?.grandTotal, 180);
    await deleteInvoice('invoice-1');

    assert.deepEqual(
      calls.map((call) => call.method),
      ['GET', 'GET', 'POST', 'PUT', 'DELETE']
    );
  } finally {
    if (originalFetch) {
      globalScope.fetch = originalFetch;
    } else {
      Reflect.deleteProperty(globalScope, 'fetch');
    }
  }
}

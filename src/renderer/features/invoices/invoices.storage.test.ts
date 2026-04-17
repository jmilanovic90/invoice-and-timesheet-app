import assert from 'node:assert/strict';
import type { InvoiceDraft } from '../../../shared/types/invoice';
import { getTodayLocalIsoDate } from '../../lib/utils/date';
import {
  createInvoice,
  deleteInvoice,
  getInvoiceById,
  getInvoices,
  updateInvoice
} from './invoices.storage';

type LocalStorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function createLocalStorageMock(seed: Record<string, string> = {}): LocalStorageLike {
  const store = new Map(Object.entries(seed));

  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    }
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

export async function runInvoicesStorageTests(): Promise<void> {
  const globalScope = globalThis as { window?: Window };
  const originalWindow = globalScope.window;
  const localStorage = createLocalStorageMock({
    'invoice-app/invoices': JSON.stringify([{ id: 'legacy-invoice' }])
  });
  globalScope.window = { localStorage: localStorage as unknown as Storage } as Window;

  try {
    const initialInvoices = await getInvoices();
    assert.deepEqual(initialInvoices, []);
    assert.equal(localStorage.getItem('invoice-app/invoices'), null);

    const createdInvoice = await createInvoice(createDraft());
    assert.equal(createdInvoice.grandTotal, 100);
    assert.equal((await getInvoices()).length, 1);
    assert.equal((await getInvoiceById(createdInvoice.id))?.id, createdInvoice.id);

    const updatedInvoice = await updateInvoice(createdInvoice.id, {
      ...createDraft(),
      items: [
        {
          id: 'item-2',
          description: 'Updated service',
          unit: 'day',
          quantity: 1,
          price: 200,
          discount: 10,
          total: 0
        }
      ]
    });
    assert.equal(updatedInvoice?.grandTotal, 180);

    await deleteInvoice(createdInvoice.id);
    assert.deepEqual(await getInvoices(), []);
  } finally {
    if (originalWindow) {
      globalScope.window = originalWindow;
    } else {
      Reflect.deleteProperty(globalScope, 'window');
    }
  }
}

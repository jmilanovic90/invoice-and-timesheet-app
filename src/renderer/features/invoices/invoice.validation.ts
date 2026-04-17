import type { InvoiceDraft } from '../../../shared/types/invoice';

export interface InvoiceValidationResult {
  clientId?: string;
  tradingPlace?: string;
  items?: string;
}

export function validateInvoice(draft: InvoiceDraft): InvoiceValidationResult {
  const errors: InvoiceValidationResult = {};

  if (!draft.clientId) {
    errors.clientId = 'A client must be selected.';
  }

  if (!draft.tradingPlace.trim()) {
    errors.tradingPlace = 'Trading place is required.';
  }

  const hasInvalidItem = draft.items.some(
    (item) => !item.description.trim() || item.quantity <= 0 || item.price < 0 || item.discount < 0
  );

  if (!draft.items.length || hasInvalidItem) {
    errors.items = 'Each line item needs a description, quantity, and price.';
  }

  return errors;
}

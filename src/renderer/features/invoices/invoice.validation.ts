import type { InvoiceDraft } from '../../../shared/types/invoice';
import { hasMaxLength, hasText, isIsoDate, isValidIban } from '../../lib/utils/validation';

export interface InvoiceValidationResult {
  clientId?: string;
  invoiceDate?: string;
  tradingDate?: string;
  tradingPlace?: string;
  paymentDeadlineDays?: string;
  issuerIban?: string;
  notes?: string;
  taxNote?: string;
  items?: string;
}

export function validateInvoice(draft: InvoiceDraft): InvoiceValidationResult {
  const errors: InvoiceValidationResult = {};

  if (!draft.clientId) {
    errors.clientId = 'A client must be selected.';
  }

  if (!isIsoDate(draft.invoiceDate)) {
    errors.invoiceDate = 'Invoice date is required.';
  }

  if (!isIsoDate(draft.tradingDate)) {
    errors.tradingDate = 'Trading date is required.';
  }

  if (!hasText(draft.tradingPlace)) {
    errors.tradingPlace = 'Trading place is required.';
  } else if (!hasMaxLength(draft.tradingPlace, 80)) {
    errors.tradingPlace = 'Trading place must be 80 characters or fewer.';
  }

  if (draft.paymentDeadlineDays <= 0 || draft.paymentDeadlineDays > 365) {
    errors.paymentDeadlineDays = 'Payment deadline must be between 1 and 365 days.';
  }

  if (draft.issuerIban && !isValidIban(draft.issuerIban)) {
    errors.issuerIban = 'Enter a valid IBAN.';
  }

  if (!hasMaxLength(draft.notes, 1500)) {
    errors.notes = 'Comment must be 1500 characters or fewer.';
  }

  if (!hasMaxLength(draft.taxNote, 1500)) {
    errors.taxNote = 'Tax note must be 1500 characters or fewer.';
  }

  const hasInvalidItem = draft.items.some(
    (item) =>
      !hasText(item.description) ||
      !hasMaxLength(item.description, 200) ||
      item.quantity <= 0 ||
      item.quantity > 1_000_000 ||
      item.price < 0 ||
      item.price > 1_000_000_000 ||
      item.discount < 0 ||
      item.discount > 100
  );

  if (!draft.items.length || hasInvalidItem) {
    errors.items = 'Each line item needs a valid description, quantity, price, and discount.';
  }

  return errors;
}

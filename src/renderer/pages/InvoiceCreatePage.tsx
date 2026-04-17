import { useEffect, useMemo, useState } from 'react';
import { invoiceCurrencies, type CurrencyCode } from '../../shared/types/currency';
import type { Client } from '../../shared/types/client';
import type { Company } from '../../shared/types/company';
import type { InvoiceDraft, InvoiceItem, InvoiceUnit } from '../../shared/types/invoice';
import { Button } from '../components/common/Button';
import { InputField } from '../components/common/InputField';
import { SectionCard } from '../components/common/SectionCard';
import { SelectField } from '../components/common/SelectField';
import { TextareaField } from '../components/common/TextareaField';
import { InvoiceDocument } from '../components/invoices/InvoiceDocument';
import { getClients } from '../features/clients/clients.storage';
import { getCompany } from '../features/company/company.storage';
import { createEmptyInvoiceItem, defaultInvoiceDraft } from '../features/invoices/invoice.defaults';
import { calculateInvoiceTotals, normalizeInvoiceDraft } from '../features/invoices/invoice.helpers';
import {
  createInvoice,
  getInvoiceById,
  getInvoices,
  updateInvoice
} from '../features/invoices/invoices.storage';
import { validateInvoice, type InvoiceValidationResult } from '../features/invoices/invoice.validation';
import { formatCurrency } from '../lib/formatters/currency';
import { printInvoiceDocument } from '../lib/print/print-invoice';

const unitOptions: Array<{ label: string; value: InvoiceUnit }> = [
  { label: 'Hour', value: 'hour' },
  { label: 'Day', value: 'day' },
  { label: 'Service', value: 'service' }
];

const currencyOptions: Array<{ label: string; value: CurrencyCode }> = invoiceCurrencies.map((currency) => ({
  label: currency,
  value: currency
}));

function clampNumberInput(value: string, min: number, max: number): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return min;
  }

  return Math.min(max, Math.max(min, parsed));
}

function normalizeInvoiceField(name: string, value: string): string | number {
  if (name === 'paymentDeadlineDays') {
    return clampNumberInput(value, 0, 365);
  }

  if (name === 'issuerIban') {
    return value.toUpperCase().replace(/\s+/g, '');
  }

  if (name === 'tradingPlace') {
    return value.slice(0, 80);
  }

  if (name === 'notes' || name === 'taxNote') {
    return value.slice(0, 1500);
  }

  return value;
}

interface InvoiceCreatePageProps {
  editingInvoiceId?: string | null;
  onFinishEditing?: () => void;
}

export function InvoiceCreatePage({ editingInvoiceId = null, onFinishEditing }: InvoiceCreatePageProps) {
  const [company, setCompany] = useState<Company | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [draft, setDraft] = useState<InvoiceDraft>(defaultInvoiceDraft);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errors, setErrors] = useState<InvoiceValidationResult>({});
  const [existingInvoiceNumber, setExistingInvoiceNumber] = useState<string | null>(null);
  const ibanOptions = useMemo(
    () =>
      [
        { label: 'Default IBAN', value: company?.iban1 || '' },
        { label: 'IBAN 2', value: company?.iban2 || '' },
        { label: 'IBAN 3', value: company?.iban3 || '' }
      ].filter((option) => option.value),
    [company]
  );

  const loadDependencies = async () => {
    const [companyResponse, clientsResponse, invoicesResponse, editingInvoice] = await Promise.all([
      getCompany(),
      getClients(),
      getInvoices(),
      editingInvoiceId ? getInvoiceById(editingInvoiceId) : Promise.resolve(null)
    ]);

    setCompany(companyResponse);
    setClients(clientsResponse);
    setInvoiceCount(invoicesResponse.length);

    if (editingInvoice) {
      const {
        id: _id,
        invoiceNumber,
        subtotal: _subtotal,
        discountTotal: _discountTotal,
        grandTotal: _grandTotal,
        ...editingDraft
      } = editingInvoice;
      setExistingInvoiceNumber(invoiceNumber);
      setDraft({
        ...editingDraft,
        issuerIban: editingDraft.issuerIban || companyResponse?.iban1 || ''
      });
      return;
    }

    setExistingInvoiceNumber(null);
    setDraft((current) => ({
      ...current,
      clientId: '',
      issuerIban: companyResponse?.iban1 || '',
      tradingPlace: current.tradingPlace || companyResponse?.city || ''
    }));
  };

  useEffect(() => {
    void loadDependencies();
  }, [editingInvoiceId]);

  const selectedClient = clients.find((client) => client.id === draft.clientId) ?? null;
  const normalizedDraft = useMemo(() => normalizeInvoiceDraft(draft), [draft]);
  const totals = useMemo(() => calculateInvoiceTotals(normalizedDraft.items), [normalizedDraft.items]);
  const previewInvoiceNumber =
    existingInvoiceNumber ?? `${invoiceCount + 1}/${new Date(draft.invoiceDate).getFullYear()}`;
  const previewInvoice = {
    ...normalizedDraft,
    invoiceNumber: previewInvoiceNumber,
    ...totals
  };

  const handleFieldChange = (name: string, value: string) => {
    const nextValue = normalizeInvoiceField(name, value);

    setDraft((current) => ({
      ...current,
      [name]: nextValue
    }));
    setErrors((current) => ({
      ...current,
      [name]: undefined
    }));
    setStatusMessage('');
  };

  const handleItemChange = (itemId: string, field: keyof InvoiceItem, value: string) => {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              [field]:
                field === 'quantity'
                  ? clampNumberInput(value, 0, 1_000_000)
                  : field === 'price'
                    ? clampNumberInput(value, 0, 1_000_000_000)
                    : field === 'discount'
                      ? clampNumberInput(value, 0, 100)
                      : value.slice(0, 200)
            }
          : item
      )
    }));
    setErrors((current) => ({
      ...current,
      items: undefined
    }));
    setStatusMessage('');
  };

  const handleAddItem = () => {
    setDraft((current) => ({
      ...current,
      items: [...current.items, createEmptyInvoiceItem()]
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setDraft((current) => ({
      ...current,
      items: current.items.length === 1 ? current.items : current.items.filter((item) => item.id !== itemId)
    }));
  };

  const handleSaveInvoice = async () => {
    const validationErrors = validateInvoice(draft);
    const hasErrors = Object.values(validationErrors).some(Boolean);

    if (hasErrors) {
      setErrors(validationErrors);
      setStatusMessage('Please review the highlighted invoice fields before saving.');
      return;
    }

    if (editingInvoiceId) {
      const updatedInvoice = await updateInvoice(editingInvoiceId, draft);
      if (updatedInvoice) {
        setStatusMessage(`Invoice ${updatedInvoice.invoiceNumber} updated successfully.`);
      }
      await loadDependencies();
      return;
    }

    const savedInvoice = await createInvoice(draft);
    setStatusMessage(`Invoice ${savedInvoice.invoiceNumber} saved successfully.`);
    setDraft({
      ...defaultInvoiceDraft,
      invoiceDate: draft.invoiceDate,
      tradingDate: draft.tradingDate,
      tradingPlace: draft.tradingPlace,
      clientId: draft.clientId,
      issuerIban: company?.iban1 || '',
      items: [createEmptyInvoiceItem()]
    });
    await loadDependencies();
  };

  return (
    <div className="page">
      <div className="page__intro page__intro--wide">
        <div>
          <p className="page__eyebrow">{editingInvoiceId ? 'Edit invoice' : 'New invoice'}</p>
          <h1>{editingInvoiceId ? 'Update a saved invoice' : 'Create and save a client invoice'}</h1>
          <p>
            The editor controls the printable invoice preview on the right. The layout, wording,
            and summary structure follow your sample as closely as possible in this web version.
          </p>
        </div>
      </div>

      <div className="invoice-studio">
        <SectionCard
          title="Invoice editor"
          description={
            editingInvoiceId
              ? 'Edit the stored invoice data and save your changes.'
              : 'Select a client, enter dates and line items, then save the invoice.'
          }
          action={
            <div className="inline-actions">
              {editingInvoiceId && onFinishEditing ? (
                <Button variant="secondary" onClick={onFinishEditing}>
                  Back to invoice
                </Button>
              ) : null}
              <Button
                variant="secondary"
                onClick={() => {
                  const root = document.querySelector('[data-print-root="invoice-document"]');
                  if (root instanceof HTMLElement) {
                    printInvoiceDocument(root, previewInvoiceNumber);
                  }
                }}
              >
                Print / Save PDF
              </Button>
              <Button onClick={() => void handleSaveInvoice()}>
                {editingInvoiceId ? 'Save changes' : 'Save invoice'}
              </Button>
            </div>
          }
        >
          <div className="invoice-editor">
            <div className="form-grid">
              <SelectField
                label="Client"
                name="clientId"
                value={draft.clientId}
                onChange={handleFieldChange}
                options={[
                  { label: '', value: '' },
                  ...clients.map((client) => ({ label: client.name, value: client.id }))
                ]}
                error={errors.clientId}
              />
              <InputField
                label="Trading place"
                name="tradingPlace"
                value={draft.tradingPlace}
                onChange={handleFieldChange}
                error={errors.tradingPlace}
                maxLength={80}
              />
              <InputField
                label="Invoice date"
                name="invoiceDate"
                value={draft.invoiceDate}
                onChange={handleFieldChange}
                error={errors.invoiceDate}
                type="date"
              />
              <InputField
                label="Trading date"
                name="tradingDate"
                value={draft.tradingDate}
                onChange={handleFieldChange}
                error={errors.tradingDate}
                type="date"
              />
              <InputField
                label="Payment deadline (days)"
                name="paymentDeadlineDays"
                value={String(draft.paymentDeadlineDays)}
                onChange={handleFieldChange}
                error={errors.paymentDeadlineDays}
                type="number"
                min={1}
                max={365}
                step={1}
              />
              <SelectField
                label="IBAN"
                name="issuerIban"
                value={draft.issuerIban}
                onChange={handleFieldChange}
                options={ibanOptions.length ? ibanOptions : [{ label: 'No IBAN saved', value: '' }]}
                error={errors.issuerIban}
              />
              <SelectField
                label="Currency"
                name="currency"
                value={draft.currency}
                onChange={handleFieldChange}
                options={currencyOptions}
              />
            </div>

            <div className="invoice-line-items">
              <div className="invoice-line-items__header">
                <div>
                  <h3>Line items</h3>
                  <p>Each row represents one billable service entry.</p>
                </div>
                <Button variant="secondary" onClick={handleAddItem}>
                  Add line item
                </Button>
              </div>

              {normalizedDraft.items.map((item, index) => (
                <div key={item.id} className="line-item-card">
                  <div className="line-item-card__top">
                    <strong>Item {index + 1}</strong>
                    <Button variant="secondary" onClick={() => handleRemoveItem(item.id)}>
                      Remove
                    </Button>
                  </div>
                  <div className="form-grid form-grid--items">
                    <InputField
                      label="Service description"
                      name={`description-${item.id}`}
                      value={item.description}
                      onChange={(_name, value) => handleItemChange(item.id, 'description', value)}
                      maxLength={200}
                    />
                    <SelectField
                      label="Unit"
                      name={`unit-${item.id}`}
                      value={item.unit}
                      onChange={(_name, value) => handleItemChange(item.id, 'unit', value)}
                      options={unitOptions}
                    />
                    <InputField
                      label="Quantity"
                      name={`quantity-${item.id}`}
                      value={String(item.quantity)}
                      onChange={(_name, value) => handleItemChange(item.id, 'quantity', value)}
                      type="number"
                      min={0}
                      max={1000000}
                      step={0.01}
                    />
                    <InputField
                      label="Price"
                      name={`price-${item.id}`}
                      value={String(item.price)}
                      onChange={(_name, value) => handleItemChange(item.id, 'price', value)}
                      type="number"
                      min={0}
                      max={1000000000}
                      step={0.01}
                    />
                    <InputField
                      label="Discount (%)"
                      name={`discount-${item.id}`}
                      value={String(item.discount)}
                      onChange={(_name, value) => handleItemChange(item.id, 'discount', value)}
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                    />
                    <div className="line-item-total">
                      <span className="field__label">Line total</span>
                      <strong>{formatCurrency(item.total, draft.currency)}</strong>
                    </div>
                  </div>
                </div>
              ))}

              {errors.items ? <div className="input-field__error">{errors.items}</div> : null}
            </div>

            <div className="form-grid">
              <TextareaField
                label="Comment / description of service"
                name="notes"
                value={draft.notes}
                onChange={handleFieldChange}
                placeholder="Payment deadline is 15 days."
                maxLength={1500}
              />
              <TextareaField
                label="Note on tax exemption"
                name="taxNote"
                value={draft.taxNote}
                onChange={handleFieldChange}
                placeholder="VAT note"
                maxLength={1500}
              />
            </div>

            {errors.notes ? <div className="input-field__error">{errors.notes}</div> : null}
            {errors.taxNote ? <div className="input-field__error">{errors.taxNote}</div> : null}

            <div className="form-actions">
              <div className="form-actions__status">{statusMessage}</div>
              <div className="invoice-editor__totals">
                <span>Draft total</span>
                <strong>{formatCurrency(totals.grandTotal, draft.currency)}</strong>
              </div>
            </div>
          </div>
        </SectionCard>

        <InvoiceDocument invoice={previewInvoice} company={company} client={selectedClient} />
      </div>
    </div>
  );
}

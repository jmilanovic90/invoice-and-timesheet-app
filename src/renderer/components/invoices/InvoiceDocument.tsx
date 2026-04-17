import { useState } from 'react';
import type { Client } from '../../../shared/types/client';
import type { Company } from '../../../shared/types/company';
import type { Invoice, InvoiceDraft, InvoiceUnit } from '../../../shared/types/invoice';

interface InvoiceDocumentProps {
  invoice: Invoice | (InvoiceDraft & { invoiceNumber: string; subtotal: number; discountTotal: number; grandTotal: number });
  company: Company | null;
  client: Client | null;
}

const unitLabels: Record<InvoiceUnit, string> = {
  hour: 'Hour',
  day: 'Day',
  service: 'Service'
};

function formatDisplayDate(value: string): string {
  return value ? value.split('-').reverse().join('.') : '-';
}

export function InvoiceDocument({ invoice, company, client }: InvoiceDocumentProps) {
  const [isLogoVisible, setIsLogoVisible] = useState(true);
  const issuerIban = invoice.issuerIban || company?.iban1 || '-';
  const logoSource = company?.logoDataUrl || '';

  return (
    <section className="invoice-document" data-print-root="invoice-document">
      <div className="invoice-document__header">
        <div className="invoice-document__title">
          <h2>Invoice:</h2>
          <div className="invoice-document__number">{invoice.invoiceNumber}</div>
        </div>
        <div className="invoice-document__meta-item">
          <span>Invoice date</span>
          <strong>{formatDisplayDate(invoice.invoiceDate)}</strong>
        </div>
        <div className="invoice-document__meta-item">
          <span>Trading date</span>
          <strong>{formatDisplayDate(invoice.tradingDate)}</strong>
        </div>
        <div className="invoice-document__meta-item">
          <span>Trading place</span>
          <strong>{invoice.tradingPlace}</strong>
        </div>
      </div>

      <div className="invoice-document__parties">
        <div className="invoice-document__from">
          <p className="invoice-document__caption">From:</p>
          <h3>{company?.name || 'Your company name'}</h3>
          <p>{company?.fullName || 'Full legal company name'}</p>
          <p>{company?.address || 'Company address'}</p>
          <p>{company?.city || 'City'}</p>
          <p>VAT / Tax no.: {company?.vatNumber || '-'}</p>
          <p>ID no.: {company?.registrationId || '-'}</p>
          <p>IBAN: {issuerIban}</p>
          <p>SWIFT: {company?.swift || '-'}</p>
          <p>Email: {company?.email || '-'}</p>
        </div>

        <div className="invoice-document__billto">
          <p className="invoice-document__caption">Bill to:</p>
          <h3>{client?.name || 'Select a client'}</h3>
          <p>Address: {client?.address || '-'}</p>
          <p>City: {client?.city || '-'}</p>
          <p>Country: {client?.country || '-'}</p>
          <p>VAT / Tax no.: {client?.vatNumber || '-'}</p>
        </div>
      </div>

      <div className="invoice-document__table">
        <div className="invoice-document__row invoice-document__row--head">
          <span>Type of service</span>
          <span>Unit</span>
          <span>Quantity</span>
          <span>Price</span>
          <span>Discount</span>
          <span>Total</span>
        </div>
        {invoice.items.map((item) => (
          <div key={item.id} className="invoice-document__row">
            <span>{item.description || 'Service line description'}</span>
            <span>{unitLabels[item.unit]}</span>
            <span>{item.quantity.toFixed(2)}</span>
            <span>{item.price.toFixed(2)}</span>
            <span>{item.discount.toFixed(2)}%</span>
            <span>{item.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="invoice-document__summary">
        <div className="invoice-document__summary-row">
          <span className="invoice-document__summary-label">Total ({invoice.currency})</span>
          <strong className="invoice-document__summary-value">{invoice.subtotal.toFixed(2)}</strong>
        </div>
        <div className="invoice-document__summary-row">
          <span className="invoice-document__summary-label">Discount ({invoice.currency})</span>
          <strong className="invoice-document__summary-value">{invoice.discountTotal.toFixed(2)}</strong>
        </div>
        <div className="invoice-document__summary-row">
          <span className="invoice-document__summary-label">Total for payment ({invoice.currency})</span>
          <strong className="invoice-document__summary-value">{invoice.grandTotal.toFixed(2)}</strong>
        </div>
      </div>

      <div className="invoice-document__notes">
        <div>
          <h4>Comment / Description of service</h4>
          {invoice.notes.split('\n').map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p>Identification number:</p>
          <p>{invoice.invoiceNumber.replace('/', '')}-{client?.id || 'pending'}</p>
          <p>Document is valid without stamp and signature.</p>
          <p>Place of issue: {invoice.tradingPlace}</p>
        </div>

        <div>
          <h4>Note on tax exemption</h4>
          {invoice.taxNote.split('\n').map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>

      {isLogoVisible && logoSource ? (
        <div className="invoice-document__logo">
          <img
            src={logoSource}
            alt="Stress Test logo"
            onError={() => setIsLogoVisible(false)}
          />
        </div>
      ) : null}
    </section>
  );
}

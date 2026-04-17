import { useEffect, useMemo, useState } from 'react';
import type { Client } from '../../shared/types/client';
import type { Company } from '../../shared/types/company';
import type { Invoice } from '../../shared/types/invoice';
import { Button } from '../components/common/Button';
import { SectionCard } from '../components/common/SectionCard';
import { InvoiceDocument } from '../components/invoices/InvoiceDocument';
import { getClients } from '../features/clients/clients.storage';
import { getCompany } from '../features/company/company.storage';
import { deleteInvoice, getInvoiceById } from '../features/invoices/invoices.storage';
import { printInvoiceDocument } from '../lib/print/print-invoice';

interface InvoiceDetailPageProps {
  invoiceId: string;
  onBack: () => void;
  onEdit: (invoiceId: string) => void;
}

export function InvoiceDetailPage({ invoiceId, onBack, onEdit }: InvoiceDetailPageProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    void Promise.all([getInvoiceById(invoiceId), getCompany(), getClients()]).then(
      ([invoiceResponse, companyResponse, clientsResponse]) => {
        setInvoice(invoiceResponse);
        setCompany(companyResponse);
        setClients(clientsResponse);
      }
    );
  }, [invoiceId]);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === invoice?.clientId) ?? null,
    [clients, invoice]
  );

  if (!invoice) {
    return (
      <div className="page">
        <div className="page__intro">
          <div>
            <p className="page__eyebrow">Invoice detail</p>
            <h1>Invoice not found</h1>
            <p>The requested invoice could not be loaded.</p>
          </div>
          <Button variant="secondary" onClick={onBack}>
            Back to invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__intro">
        <div>
          <p className="page__eyebrow">Invoice detail</p>
          <h1>Invoice {invoice.invoiceNumber}</h1>
          <p>Review the document and print or export it to PDF.</p>
        </div>
        <div className="inline-actions">
          <Button variant="secondary" onClick={onBack}>
            Back to invoices
          </Button>
          <Button variant="secondary" onClick={() => onEdit(invoice.id)}>
            Edit invoice
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              await deleteInvoice(invoice.id);
              onBack();
            }}
          >
            Delete invoice
          </Button>
          <Button
            onClick={() => {
              const root = document.querySelector('[data-print-root="invoice-document"]');
              if (root instanceof HTMLElement) {
                printInvoiceDocument(root, invoice.invoiceNumber);
              }
            }}
          >
            Print / Save PDF
          </Button>
        </div>
      </div>

      <SectionCard title="Invoice">
        <InvoiceDocument invoice={invoice} company={company} client={selectedClient} />
      </SectionCard>
    </div>
  );
}

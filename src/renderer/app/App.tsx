import { useState } from 'react';
import { AppShell } from './layout/AppShell';
import { CompanyPage } from '../pages/CompanyPage';
import { ClientsPage } from '../pages/ClientsPage';
import { InvoiceCreatePage } from '../pages/InvoiceCreatePage';
import { InvoiceDetailPage } from '../pages/InvoiceDetailPage';
import { InvoicesListPage } from '../pages/InvoicesListPage';
import { TimesheetEditorPage } from '../pages/TimesheetEditorPage';
import { TimesheetsPage } from '../pages/TimesheetsPage';
import type { TimesheetSeedConfig } from '../../shared/types/timesheet';

export type AppView = 'company' | 'clients' | 'invoice-new' | 'invoices' | 'timesheets';

export function App() {
  const [activeView, setActiveView] = useState<AppView>('invoices');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [editingTimesheetId, setEditingTimesheetId] = useState<string | null>(null);
  const [newTimesheetSeed, setNewTimesheetSeed] = useState<TimesheetSeedConfig | null>(null);

  const handleNavigate = (view: AppView) => {
    setActiveView(view);
    if (view === 'invoices') {
      setSelectedInvoiceId(null);
      setEditingInvoiceId(null);
    }

    setSelectedInvoiceId(null);
    setEditingInvoiceId(null);
    if (view === 'timesheets') {
      setEditingTimesheetId(null);
      setNewTimesheetSeed(null);
    }
  };

  let content = null;
  switch (activeView) {
    case 'company':
      content = <CompanyPage />;
      break;
    case 'clients':
      content = <ClientsPage />;
      break;
    case 'invoice-new':
      content = (
        <InvoiceCreatePage
          editingInvoiceId={editingInvoiceId}
          onFinishEditing={() => {
            setActiveView('invoices');
            if (editingInvoiceId) {
              setSelectedInvoiceId(editingInvoiceId);
            }
            setEditingInvoiceId(null);
          }}
        />
      );
      break;
    case 'invoices':
      content = selectedInvoiceId ? (
        <InvoiceDetailPage
          invoiceId={selectedInvoiceId}
          onBack={() => setSelectedInvoiceId(null)}
          onEdit={(invoiceId) => {
            setSelectedInvoiceId(null);
            setEditingInvoiceId(invoiceId);
            setActiveView('invoice-new');
          }}
        />
      ) : (
        <InvoicesListPage
          onCreateInvoice={() => {
            setSelectedInvoiceId(null);
            setEditingInvoiceId(null);
            setActiveView('invoice-new');
          }}
          onOpenInvoice={setSelectedInvoiceId}
          onEditInvoice={(invoiceId) => {
            setEditingInvoiceId(invoiceId);
            setActiveView('invoice-new');
          }}
        />
      );
      break;
    case 'timesheets':
      content = editingTimesheetId || newTimesheetSeed ? (
        <TimesheetEditorPage
          editingTimesheetId={editingTimesheetId}
          seedConfig={newTimesheetSeed}
          onClose={() => {
            setEditingTimesheetId(null);
            setNewTimesheetSeed(null);
            setActiveView('timesheets');
          }}
        />
      ) : (
        <TimesheetsPage
          onCreateTimesheet={(seed) => {
            setEditingTimesheetId(null);
            setNewTimesheetSeed(seed);
            setActiveView('timesheets');
          }}
          onEditTimesheet={(timesheetId) => {
            setNewTimesheetSeed(null);
            setEditingTimesheetId(timesheetId);
            setActiveView('timesheets');
          }}
        />
      );
      break;
  }

  return (
    <AppShell activeView={activeView} onNavigate={handleNavigate}>
      {content}
    </AppShell>
  );
}

import { useEffect, useState } from 'react';
import { Button } from '../components/common/Button';
import { Pagination } from '../components/common/Pagination';
import { SectionCard } from '../components/common/SectionCard';
import { ClientForm } from '../components/clients/ClientForm';
import type { Client } from '../../shared/types/client';
import { createClient, deleteClient, getClients, updateClient } from '../features/clients/clients.storage';

export function ClientsPage() {
  const pageSize = 3;
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadClients = async () => {
    const response = await getClients();
    setClients(response);
  };

  useEffect(() => {
    void loadClients();
  }, []);

  const totalPages = Math.max(1, Math.ceil(clients.length / pageSize));

  useEffect(() => {
    setCurrentPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const paginatedClients = clients.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const selectedClient = clients.find((client) => client.id === selectedClientId) ?? null;

  const handleCreateClient = async (values: Omit<Client, 'id'>) => {
    await createClient(values);
    await loadClients();
  };

  const handleUpdateClient = async (values: Client) => {
    await updateClient(values);
    await loadClients();
    setSelectedClientId(values.id);
  };

  const handleDeleteClient = async (clientId: string) => {
    await deleteClient(clientId);
    await loadClients();
    if (selectedClientId === clientId) {
      setSelectedClientId(null);
    }
  };

  return (
    <div className="page">
      <div className="page__intro">
        <div>
          <p className="page__eyebrow">Clients</p>
          <h1>Client directory</h1>
          <p>
            Clients can now be created, updated, and deleted locally. This directory feeds the
            client selector inside the invoice editor.
          </p>
        </div>
      </div>

      <div className="split-grid">
        <SectionCard
          title={selectedClient ? 'Edit client' : 'New client'}
          description="Add a new client or update an existing one."
        >
          <ClientForm
            selectedClient={selectedClient}
            onCreate={handleCreateClient}
            onUpdate={handleUpdateClient}
            onCancelEdit={() => setSelectedClientId(null)}
          />
        </SectionCard>

        <SectionCard
          title="Clients"
          description="Pick a row to edit, or remove a client that is no longer needed."
        >
          {clients.length === 0 ? (
            <div className="empty-state">No clients have been added yet.</div>
          ) : (
            <div className="table-shell">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>City</th>
                    <th>Country</th>
                    <th>VAT / Tax no.</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedClients.map((client) => (
                    <tr
                      key={client.id}
                      className={client.id === selectedClientId ? 'data-table__row--active' : undefined}
                    >
                      <td>{client.name}</td>
                      <td>{client.city}</td>
                      <td>{client.country}</td>
                      <td>{client.vatNumber}</td>
                      <td>
                        <div className="inline-actions">
                          <Button variant="secondary" onClick={() => setSelectedClientId(client.id)}>
                            Edit
                          </Button>
                          <Button variant="secondary" onClick={() => void handleDeleteClient(client.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={clients.length}
            onPageChange={setCurrentPage}
          />
        </SectionCard>
      </div>
    </div>
  );
}

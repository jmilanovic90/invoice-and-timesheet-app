import { useEffect, useState, type FormEvent } from 'react';
import type { Client } from '../../../shared/types/client';
import { emptyClient } from '../../features/clients/client.defaults';
import { validateClient, type ClientValidationResult } from '../../features/clients/client.validation';
import { Button } from '../common/Button';
import { InputField } from '../common/InputField';

interface ClientFormProps {
  selectedClient: Client | null;
  onCreate: (values: Omit<Client, 'id'>) => Promise<void>;
  onUpdate: (values: Client) => Promise<void>;
  onCancelEdit: () => void;
}

export function ClientForm({
  selectedClient,
  onCreate,
  onUpdate,
  onCancelEdit
}: ClientFormProps) {
  const [formValues, setFormValues] = useState<Client>(emptyClient);
  const [errors, setErrors] = useState<ClientValidationResult>({});
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setFormValues(selectedClient ?? emptyClient);
    setErrors({});
    setStatusMessage('');
  }, [selectedClient]);

  const handleChange = (name: string, value: string) => {
    setFormValues((current) => ({
      ...current,
      [name]: value
    }));
    setErrors((current) => ({
      ...current,
      [name]: undefined
    }));
    setStatusMessage('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateClient(formValues);
    const hasErrors = Object.values(validationErrors).some(Boolean);

    if (hasErrors) {
      setErrors(validationErrors);
      setStatusMessage('Please review the required fields before saving.');
      return;
    }

    setIsSaving(true);

    try {
      if (selectedClient) {
        await onUpdate(formValues);
        setStatusMessage('Client updated successfully.');
      } else {
        await onCreate({
          name: formValues.name,
          address: formValues.address,
          city: formValues.city,
          country: formValues.country,
          vatNumber: formValues.vatNumber
        });
        setFormValues(emptyClient);
        setStatusMessage('Client added successfully.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <InputField
        label="Client name"
        name="name"
        value={formValues.name}
        onChange={handleChange}
        error={errors.name}
      />
      <InputField
        label="Address"
        name="address"
        value={formValues.address}
        onChange={handleChange}
        error={errors.address}
      />
      <InputField
        label="City"
        name="city"
        value={formValues.city}
        onChange={handleChange}
        error={errors.city}
      />
      <InputField
        label="Country"
        name="country"
        value={formValues.country}
        onChange={handleChange}
      />
      <InputField
        label="PIB / VAT"
        name="vatNumber"
        value={formValues.vatNumber}
        onChange={handleChange}
        error={errors.vatNumber}
      />

      <div className="form-actions">
        <div className="form-actions__status">{statusMessage}</div>
        <div className="inline-actions">
          {selectedClient ? (
            <Button variant="secondary" onClick={onCancelEdit}>
              Cancel edit
            </Button>
          ) : null}
          <Button type="submit" disabled={isSaving}>
            {isSaving
              ? 'Saving...'
              : selectedClient
                ? 'Save changes'
                : 'Add client'}
          </Button>
        </div>
      </div>
    </form>
  );
}

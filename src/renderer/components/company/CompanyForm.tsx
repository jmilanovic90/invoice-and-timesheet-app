import { useEffect, useState, type FormEvent } from 'react';
import type { Company } from '../../../shared/types/company';
import { emptyCompany } from '../../features/company/company.defaults';
import { getCompany, saveCompany } from '../../features/company/company.storage';
import { validateCompany, type CompanyValidationResult } from '../../features/company/company.validation';
import { InputField } from '../common/InputField';
import { Button } from '../common/Button';

export function CompanyForm() {
  const [formValues, setFormValues] = useState<Company>(emptyCompany);
  const [errors, setErrors] = useState<CompanyValidationResult>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [logoFileName, setLogoFileName] = useState('');

  useEffect(() => {
    void getCompany().then((response) => {
      setFormValues(response ?? emptyCompany);
      setIsLoading(false);
    });
  }, []);

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

  const handleLogoUpload = async (file: File | null) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    const nextValue = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(new Error('Logo upload failed.'));
      reader.readAsDataURL(file);
    });

    handleChange('logoDataUrl', nextValue);
    setLogoFileName(file.name);
    setStatusMessage('Logo uploaded and ready to save.');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateCompany(formValues);
    const hasErrors = Object.values(validationErrors).some(Boolean);

    if (hasErrors) {
      setErrors(validationErrors);
      setStatusMessage('Please review the required fields before saving.');
      return;
    }

    setIsSaving(true);

    try {
      const savedCompany = await saveCompany(formValues);
      setFormValues(savedCompany);
      setStatusMessage('Company details saved successfully.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="empty-state">Loading company details...</div>;
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <InputField
        label="Name"
        name="name"
        value={formValues.name}
        onChange={handleChange}
        error={errors.name}
      />
      <InputField
        label="Full legal name"
        name="fullName"
        value={formValues.fullName}
        onChange={handleChange}
        error={errors.fullName}
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
      <InputField
        label="Company ID / Registration number"
        name="registrationId"
        value={formValues.registrationId}
        onChange={handleChange}
      />
      <InputField
        label="Default IBAN"
        name="iban1"
        value={formValues.iban1}
        onChange={handleChange}
      />
      <InputField
        label="IBAN 2"
        name="iban2"
        value={formValues.iban2}
        onChange={handleChange}
      />
      <InputField
        label="IBAN 3"
        name="iban3"
        value={formValues.iban3}
        onChange={handleChange}
      />
      <InputField
        label="SWIFT"
        name="swift"
        value={formValues.swift}
        onChange={handleChange}
      />
      <InputField
        label="Email"
        name="email"
        value={formValues.email}
        onChange={handleChange}
      />
      <div className="input-field input-field--full">
        <div className="input-field__label-row">
          <span className="input-field__label">Logo image</span>
          <span
            className="info-chip"
            tabIndex={0}
            aria-label="Logo upload requirements"
            data-tooltip="Use a transparent PNG in a horizontal format. Best fit: 1200x260 px canvas, dark logo, very small empty margins, no glow, no white background."
          >
            i
          </span>
        </div>
        <div className="logo-upload">
          {!formValues.logoDataUrl ? (
            <label className="logo-upload__picker">
              <input
                className="logo-upload__input"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(event) => {
                  void handleLogoUpload(event.target.files?.[0] ?? null);
                  event.currentTarget.value = '';
                }}
              />
              <span>Upload logo</span>
            </label>
          ) : null}
          {formValues.logoDataUrl ? (
            <div className="logo-upload__status" aria-live="polite">
              <span className="logo-upload__status-icon" aria-hidden="true">
                ✓
              </span>
              <span>{logoFileName || 'Logo uploaded'}</span>
            </div>
          ) : null}
          {formValues.logoDataUrl ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                handleChange('logoDataUrl', '');
                setLogoFileName('');
                setStatusMessage('Logo removed. Save company details to apply the change.');
              }}
            >
              Remove logo
            </Button>
          ) : null}
        </div>
        {!formValues.logoDataUrl ? (
          <div className="logo-upload__empty">No logo uploaded. Invoice and timesheet will render without a logo.</div>
        ) : null}
      </div>

      <div className="form-actions">
        <div className="form-actions__status">{statusMessage}</div>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save company details'}
        </Button>
      </div>
    </form>
  );
}


import { SectionCard } from '../components/common/SectionCard';
import { CompanyForm } from '../components/company/CompanyForm';

export function CompanyPage() {
  return (
    <div className="page">
      <div className="page__intro">
        <div>
          <p className="page__eyebrow">Company</p>
          <h1>Invoice issuer profile</h1>
          <p>Manage the issuer details used across invoices and timesheets.</p>
        </div>
      </div>

      <SectionCard title="Company details">
        <CompanyForm />
      </SectionCard>
    </div>
  );
}

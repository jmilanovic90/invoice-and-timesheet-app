import assert from 'node:assert/strict';
import type { Company } from '../../../shared/types/company';
import { validateCompany } from './company.validation';

const validCompany: Company = {
  name: 'Stress Test',
  fullName: 'Jovana Milanovic PR Racunarsko programiranje STRESS TEST Novi Sad',
  address: 'Djordja Nikisca 25',
  city: 'Novi Sad',
  country: 'Serbia',
  vatNumber: '114139084',
  registrationId: '67350146',
  iban1: 'RS35325960170008442473',
  iban2: '',
  iban3: '',
  swift: 'OTPVRS22',
  email: 'test@example.com',
  logoDataUrl: ''
};

export function runCompanyValidationTests(): void {
  assert.deepEqual(validateCompany(validCompany), {});
  assert.deepEqual(
    validateCompany({
      ...validCompany,
      name: '',
      fullName: '',
      address: '',
      city: '',
      country: 'X'.repeat(81),
      vatNumber: '',
      registrationId: 'Y'.repeat(41),
      iban1: 'bad',
      swift: 'oops',
      email: 'invalid-email'
    }),
    {
      name: 'Company name is required.',
      fullName: 'Full legal name is required.',
      address: 'Address is required.',
      city: 'City is required.',
      country: 'Country must be 80 characters or fewer.',
      vatNumber: 'VAT / tax number is required.',
      registrationId: 'Registration number must be 40 characters or fewer.',
      iban1: 'Enter a valid IBAN.',
      swift: 'Enter a valid SWIFT code.',
      email: 'Enter a valid email address.'
    }
  );
}

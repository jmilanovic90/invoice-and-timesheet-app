type TestCase = {
  name: string;
  run: () => void | Promise<void>;
};

import { runClientValidationTests } from '../renderer/features/clients/client.validation.test';
import { runCompanyValidationTests } from '../renderer/features/company/company.validation.test';
import { runInvoiceHelperTests } from '../renderer/features/invoices/invoice.helpers.test';
import { runInvoiceNumberTests } from '../renderer/features/invoices/invoice-number.service.test';
import { runInvoicesStorageTests } from '../renderer/features/invoices/invoices.storage.test';
import { runInvoiceValidationTests } from '../renderer/features/invoices/invoice.validation.test';
import { runTimesheetHelperTests } from '../renderer/features/timesheets/timesheet.helpers.test';
import { runTimesheetsStorageTests } from '../renderer/features/timesheets/timesheets.storage.test';
import { runTimesheetValidationTests } from '../renderer/features/timesheets/timesheet.validation.test';
import { runWebStorageTests } from '../renderer/lib/storage/web-storage.test';
import { runDateUtilTests } from '../renderer/lib/utils/date.test';

const tests: TestCase[] = [
  { name: 'client.validation', run: runClientValidationTests },
  { name: 'company.validation', run: runCompanyValidationTests },
  { name: 'invoice.helpers', run: runInvoiceHelperTests },
  { name: 'invoice-number.service', run: runInvoiceNumberTests },
  { name: 'invoices.storage', run: runInvoicesStorageTests },
  { name: 'invoice.validation', run: runInvoiceValidationTests },
  { name: 'timesheet.helpers', run: runTimesheetHelperTests },
  { name: 'timesheets.storage', run: runTimesheetsStorageTests },
  { name: 'timesheet.validation', run: runTimesheetValidationTests },
  { name: 'web storage', run: runWebStorageTests },
  { name: 'date utils', run: runDateUtilTests }
];

async function main(): Promise<void> {
  let failures = 0;

  for (const test of tests) {
    try {
      await test.run();
      console.log(`PASS ${test.name}`);
    } catch (error) {
      failures += 1;
      console.error(`FAIL ${test.name}`);
      console.error(error);
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} test suite(s) failed.`);
    process.exit(1);
  }

  console.log(`\nAll ${tests.length} test suite(s) passed.`);
}

void main();

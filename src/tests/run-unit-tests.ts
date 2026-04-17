type TestCase = {
  name: string;
  run: () => void;
};

import { runInvoiceHelperTests } from '../renderer/features/invoices/invoice.helpers.test';
import { runInvoiceNumberTests } from '../renderer/features/invoices/invoice-number.service.test';
import { runInvoiceValidationTests } from '../renderer/features/invoices/invoice.validation.test';
import { runTimesheetHelperTests } from '../renderer/features/timesheets/timesheet.helpers.test';
import { runTimesheetValidationTests } from '../renderer/features/timesheets/timesheet.validation.test';
import { runDateUtilTests } from '../renderer/lib/utils/date.test';

const tests: TestCase[] = [
  { name: 'invoice.helpers', run: runInvoiceHelperTests },
  { name: 'invoice-number.service', run: runInvoiceNumberTests },
  { name: 'invoice.validation', run: runInvoiceValidationTests },
  { name: 'timesheet.helpers', run: runTimesheetHelperTests },
  { name: 'timesheet.validation', run: runTimesheetValidationTests },
  { name: 'date utils', run: runDateUtilTests }
];

let failures = 0;

for (const test of tests) {
  try {
    test.run();
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

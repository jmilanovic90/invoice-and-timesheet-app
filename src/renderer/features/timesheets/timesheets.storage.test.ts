import assert from 'node:assert/strict';
import type { TimesheetDraft } from '../../../shared/types/timesheet';
import { getTodayLocalIsoDate } from '../../lib/utils/date';
import {
  createTimesheet,
  deleteTimesheet,
  getTimesheetById,
  getTimesheets,
  updateTimesheet
} from './timesheets.storage';

type LocalStorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function createLocalStorageMock(seed: Record<string, string> = {}): LocalStorageLike {
  const store = new Map(Object.entries(seed));

  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    }
  };
}

function createDraft(): TimesheetDraft {
  return {
    month: 4,
    year: 2026,
    clientId: 'client-1',
    employeeName: '',
    projectName: '',
    targetHoursPerWeek: 40,
    submittedDate: getTodayLocalIsoDate(),
    days: [
      {
        date: '2026-04-01',
        slots: [
          { start: '09:00', end: '12:00' },
          { start: '', end: '' },
          { start: '', end: '' }
        ],
        comment: '',
        totalHours: 0
      },
      {
        date: '2026-04-02',
        slots: [
          { start: '13:00', end: '15:30' },
          { start: '', end: '' },
          { start: '', end: '' }
        ],
        comment: 'Review',
        totalHours: 0
      }
    ]
  };
}

export async function runTimesheetsStorageTests(): Promise<void> {
  const globalScope = globalThis as { window?: Window };
  const originalWindow = globalScope.window;
  const localStorage = createLocalStorageMock();
  globalScope.window = { localStorage: localStorage as unknown as Storage } as Window;

  try {
    assert.deepEqual(await getTimesheets(), []);

    const createdTimesheet = await createTimesheet(createDraft());
    assert.equal(createdTimesheet.totalHours, 5.5);
    assert.equal((await getTimesheets()).length, 1);
    assert.equal((await getTimesheetById(createdTimesheet.id))?.id, createdTimesheet.id);

    const updatedTimesheet = await updateTimesheet(createdTimesheet.id, {
      ...createDraft(),
      days: [
        {
          date: '2026-04-01',
          slots: [
            { start: '09:00', end: '17:00' },
            { start: '', end: '' },
            { start: '', end: '' }
          ],
          comment: '',
          totalHours: 0
        }
      ]
    });
    assert.equal(updatedTimesheet?.totalHours, 8);

    await deleteTimesheet(createdTimesheet.id);
    assert.deepEqual(await getTimesheets(), []);
  } finally {
    if (originalWindow) {
      globalScope.window = originalWindow;
    } else {
      Reflect.deleteProperty(globalScope, 'window');
    }
  }
}

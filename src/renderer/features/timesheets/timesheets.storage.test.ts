import assert from 'node:assert/strict';
import type { Timesheet, TimesheetDraft } from '../../../shared/types/timesheet';
import { getTodayLocalIsoDate } from '../../lib/utils/date';
import {
  createTimesheet,
  deleteTimesheet,
  getTimesheetById,
  getTimesheets,
  updateTimesheet
} from './timesheets.storage';

type FetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

function createFetchResponse(payload: unknown, status = 200): FetchResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload
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
      }
    ]
  };
}

function createTimesheetRecord(id: string, totalHours: number): Timesheet {
  const draft = createDraft();

  return {
    ...draft,
    id,
    totalHours
  };
}

export async function runTimesheetsStorageTests(): Promise<void> {
  const globalScope = globalThis as typeof globalThis & { fetch?: typeof fetch };
  const originalFetch = globalScope.fetch;
  const timesheet = createTimesheetRecord('timesheet-1', 3);
  const updatedTimesheet = createTimesheetRecord('timesheet-1', 8);
  const calls: Array<{ url: string; method: string }> = [];

  globalScope.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const method = init?.method ?? 'GET';
    calls.push({ url, method });

    if (url.endsWith('/timesheets') && method === 'GET') {
      return createFetchResponse([timesheet]) as unknown as Response;
    }

    if (url.endsWith('/timesheets/timesheet-1') && method === 'GET') {
      return createFetchResponse(timesheet) as unknown as Response;
    }

    if (url.endsWith('/timesheets') && method === 'POST') {
      return createFetchResponse(timesheet, 201) as unknown as Response;
    }

    if (url.endsWith('/timesheets/timesheet-1') && method === 'PUT') {
      return createFetchResponse(updatedTimesheet) as unknown as Response;
    }

    if (url.endsWith('/timesheets/timesheet-1') && method === 'DELETE') {
      return createFetchResponse(null, 204) as unknown as Response;
    }

    return createFetchResponse({ error: 'Not found' }, 404) as unknown as Response;
  }) as typeof fetch;

  try {
    assert.equal((await getTimesheets()).length, 1);
    assert.equal((await getTimesheetById('timesheet-1'))?.id, 'timesheet-1');
    assert.equal((await createTimesheet(createDraft())).totalHours, 3);
    assert.equal((await updateTimesheet('timesheet-1', createDraft()))?.totalHours, 8);
    await deleteTimesheet('timesheet-1');

    assert.deepEqual(
      calls.map((call) => call.method),
      ['GET', 'GET', 'POST', 'PUT', 'DELETE']
    );
  } finally {
    if (originalFetch) {
      globalScope.fetch = originalFetch;
    } else {
      Reflect.deleteProperty(globalScope, 'fetch');
    }
  }
}

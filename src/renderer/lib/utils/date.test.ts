import assert from 'node:assert/strict';
import { getTodayLocalIsoDate } from './date';

export function runDateUtilTests(): void {
  assert.equal(getTodayLocalIsoDate(new Date(2026, 3, 17, 8, 30, 0)), '2026-04-17');
}

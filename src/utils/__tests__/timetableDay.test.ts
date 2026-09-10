/**
 * timetableDay.test.ts
 *
 * Unit tests for getTimetableDay() — the helper that converts JS Date.getDay()
 * to the backend's 1-6 timetable day format and suppresses Sunday calls.
 *
 * Run with: npx jest --testPathPattern=timetableDay
 *       or: npx jest   (jest picks up all *.test.ts files automatically)
 */
import { getTimetableDay } from '../timetableDay';

describe('getTimetableDay', () => {
  test('Sunday (0) returns undefined — API call must be skipped', () => {
    expect(getTimetableDay(0)).toBeUndefined();
  });

  test('Monday (1) returns 1', () => {
    expect(getTimetableDay(1)).toBe(1);
  });

  test('Tuesday (2) returns 2', () => {
    expect(getTimetableDay(2)).toBe(2);
  });

  test('Wednesday (3) returns 3', () => {
    expect(getTimetableDay(3)).toBe(3);
  });

  test('Thursday (4) returns 4', () => {
    expect(getTimetableDay(4)).toBe(4);
  });

  test('Friday (5) returns 5', () => {
    expect(getTimetableDay(5)).toBe(5);
  });

  test('Saturday (6) returns 6', () => {
    expect(getTimetableDay(6)).toBe(6);
  });

  test('Result is always in range 1–6 for weekdays', () => {
    for (let day = 1; day <= 6; day++) {
      const result = getTimetableDay(day);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
    }
  });
});

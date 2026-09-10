/**
 * timetableDay.ts
 *
 * Pure helper that converts a JavaScript Date.getDay() value (0=Sunday…6=Saturday)
 * into the backend's day-of-week format (1=Monday…6=Saturday).
 *
 * Returns `undefined` for Sunday (day 0) because the school has no Sunday classes
 * and the backend rejects day=7 (le=6 constraint). When undefined is returned
 * the caller must skip the timetable API call entirely and show an empty state.
 */

/**
 * Convert a JS `Date.getDay()` value to the backend timetable day number.
 *
 * @param jsDay - Value from `new Date().getDay()` (0=Sun, 1=Mon … 6=Sat)
 * @returns     1–6 for Monday–Saturday, or `undefined` on Sunday.
 */
export function getTimetableDay(jsDay: number): number | undefined {
  if (jsDay === 0) {
    // Sunday — school has no classes; skip the API call
    return undefined;
  }
  // Monday (1) … Saturday (6) map 1-to-1 with the backend schema
  return jsDay;
}

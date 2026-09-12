/**
 * Renders a stored ISO date ("YYYY-MM-DD" or "YYYY-MM-DD HH:MM") as
 * "DD-MM-YYYY" (optionally with the time kept after it) — the date
 * format used everywhere in this app's UI. Non-date strings (e.g.
 * "Never", "") pass through unchanged so it's safe to wrap any stored
 * date-ish field with this.
 */
export function formatDate(value: string): string {
  if (!value) return value;
  const [datePart, timePart] = value.split(" ");
  const parts = datePart.split("-");
  if (parts.length !== 3) return value;
  const [year, month, day] = parts;
  if (!/^\d{4}$/.test(year) || !/^\d{1,2}$/.test(month) || !/^\d{1,2}$/.test(day)) return value;
  const formatted = `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year}`;
  return timePart ? `${formatted} ${timePart}` : formatted;
}

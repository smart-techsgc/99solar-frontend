/** Calendar date as YYYY-MM-DD in the user's local timezone. */
export function toLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Format a DB date (YYYY-MM-DD or ISO) for display without timezone shift. */
export function formatReportDate(value: string | Date | null | undefined): string {
  if (!value) return '';
  const raw = typeof value === 'string' ? value.slice(0, 10) : toLocalDateString(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(value).toLocaleDateString();
  }
  const [year, month, day] = raw.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString();
}

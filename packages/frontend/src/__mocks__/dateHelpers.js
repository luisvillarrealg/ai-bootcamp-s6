/**
 * Returns a local calendar date string (YYYY-MM-DD) offset from today.
 * @param {number} offset - Days to add to today (negative for the past)
 * @param {Date} [from] - Base date, defaults to now
 * @returns {string} Local date as YYYY-MM-DD
 */
export function daysFromToday(offset, from = new Date()) {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

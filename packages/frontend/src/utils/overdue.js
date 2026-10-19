const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Returns the local calendar date as YYYY-MM-DD.
 * @param {Date} [date] - Date to format, defaults to now
 * @returns {string} Local date string
 */
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// Parses a strict YYYY-MM-DD string to a UTC day number; null when invalid.
function toDayNumber(dateString) {
  const match = typeof dateString === 'string' ? DATE_PATTERN.exec(dateString) : null;
  if (!match) {
    return null;
  }

  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);

  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    return null;
  }

  return timestamp / MS_PER_DAY;
}

/**
 * Whole calendar days a todo is past its due date.
 * @param {Object} todo - Todo with dueDate (YYYY-MM-DD|null) and completed (0|1)
 * @param {string} today - Local date as YYYY-MM-DD
 * @returns {number} Days overdue, or 0 when not overdue or data is invalid
 */
export function getDaysOverdue(todo, today) {
  if (!todo || todo.completed === 1) {
    return 0;
  }

  const due = toDayNumber(todo.dueDate);
  const current = toDayNumber(today);
  if (due === null || current === null) {
    return 0;
  }

  return Math.max(0, Math.round(current - due));
}

/**
 * @param {Object} todo - Todo to check
 * @param {string} today - Local date as YYYY-MM-DD
 * @returns {boolean} True when the todo is incomplete and past its due date
 */
export function isOverdue(todo, today) {
  return getDaysOverdue(todo, today) > 0;
}

/**
 * @param {Object[]} todos - Todos to inspect
 * @param {string} today - Local date as YYYY-MM-DD
 * @returns {number} Number of overdue todos
 */
export function countOverdue(todos, today) {
  return todos.filter((todo) => isOverdue(todo, today)).length;
}

/**
 * @param {number} days - Days overdue (>= 1)
 * @returns {string} Label such as "Overdue by 3 days"
 */
export function formatOverdueLabel(days) {
  return `Overdue by ${days} ${days === 1 ? 'day' : 'days'}`;
}

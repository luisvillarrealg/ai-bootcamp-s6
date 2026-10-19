import {
  getLocalDateString,
  getDaysOverdue,
  isOverdue,
  countOverdue,
  formatOverdueLabel
} from '../overdue';

const TODAY = '2026-10-19';

const buildTodo = (overrides = {}) => ({
  id: 1,
  title: 'Test Todo',
  dueDate: '2026-10-18',
  completed: 0,
  ...overrides
});

describe('overdue utilities', () => {
  describe('getLocalDateString', () => {
    it('should format a date using local year, month, and day', () => {
      expect(getLocalDateString(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    });

    it('should default to the current date', () => {
      expect(getLocalDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getDaysOverdue', () => {
    it('should return 1 for a todo due yesterday', () => {
      expect(getDaysOverdue(buildTodo({ dueDate: '2026-10-18' }), TODAY)).toBe(1);
    });

    it('should return the full day count for a very old due date', () => {
      expect(getDaysOverdue(buildTodo({ dueDate: '2025-09-14' }), TODAY)).toBe(400);
    });

    it('should return 0 for a todo due today', () => {
      expect(getDaysOverdue(buildTodo({ dueDate: TODAY }), TODAY)).toBe(0);
    });

    it('should return 0 for a todo due in the future', () => {
      expect(getDaysOverdue(buildTodo({ dueDate: '2026-10-20' }), TODAY)).toBe(0);
    });

    it.each([null, undefined, ''])('should return 0 when the due date is %p', (dueDate) => {
      expect(getDaysOverdue(buildTodo({ dueDate }), TODAY)).toBe(0);
    });

    it('should return 0 for a completed todo with a past due date', () => {
      expect(getDaysOverdue(buildTodo({ completed: 1 }), TODAY)).toBe(0);
    });

    it.each(['not-a-date', '2026-13-01', '2026-02-30', '10/18/2026', '2026-10-18T00:00:00Z'])(
      'should return 0 for the invalid due date %p',
      (dueDate) => {
        expect(getDaysOverdue(buildTodo({ dueDate }), TODAY)).toBe(0);
      }
    );

    it('should return 0 when today is not a valid date string', () => {
      expect(getDaysOverdue(buildTodo(), 'invalid')).toBe(0);
    });

    it('should count correctly across a month boundary', () => {
      expect(getDaysOverdue(buildTodo({ dueDate: '2026-09-30' }), '2026-10-01')).toBe(1);
    });

    it('should count correctly across a year boundary', () => {
      expect(getDaysOverdue(buildTodo({ dueDate: '2025-12-31' }), '2026-01-01')).toBe(1);
    });

    it('should count whole days across a leap day', () => {
      expect(getDaysOverdue(buildTodo({ dueDate: '2024-02-28' }), '2024-03-01')).toBe(2);
    });

    it.each([
      ['2026-03-08', '2026-03-09'],
      ['2026-11-01', '2026-11-02'],
      ['2026-03-28', '2026-03-30']
    ])('should count whole days across a daylight saving change (%s to %s)', (dueDate, today) => {
      const expected = Math.round((Date.parse(today) - Date.parse(dueDate)) / 86400000);

      expect(getDaysOverdue(buildTodo({ dueDate }), today)).toBe(expected);
    });
  });

  describe('isOverdue', () => {
    it('should be true only for incomplete todos due before today', () => {
      expect(isOverdue(buildTodo({ dueDate: '2026-10-18' }), TODAY)).toBe(true);
      expect(isOverdue(buildTodo({ dueDate: TODAY }), TODAY)).toBe(false);
      expect(isOverdue(buildTodo({ dueDate: '2026-10-20' }), TODAY)).toBe(false);
      expect(isOverdue(buildTodo({ dueDate: null }), TODAY)).toBe(false);
      expect(isOverdue(buildTodo({ completed: 1 }), TODAY)).toBe(false);
    });
  });

  describe('countOverdue', () => {
    it('should count only the overdue todos', () => {
      const todos = [
        buildTodo({ id: 1, dueDate: '2026-10-18' }),
        buildTodo({ id: 2, dueDate: '2026-10-01' }),
        buildTodo({ id: 3, dueDate: TODAY }),
        buildTodo({ id: 4, dueDate: null }),
        buildTodo({ id: 5, dueDate: '2026-10-01', completed: 1 })
      ];

      expect(countOverdue(todos, TODAY)).toBe(2);
    });

    it('should return 0 for an empty list', () => {
      expect(countOverdue([], TODAY)).toBe(0);
    });
  });

  describe('formatOverdueLabel', () => {
    it('should use the singular form for one day', () => {
      expect(formatOverdueLabel(1)).toBe('Overdue by 1 day');
    });

    it('should use the plural form for multiple days', () => {
      expect(formatOverdueLabel(3)).toBe('Overdue by 3 days');
      expect(formatOverdueLabel(400)).toBe('Overdue by 400 days');
    });
  });
});

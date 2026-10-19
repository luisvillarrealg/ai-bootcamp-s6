# Data Model: Support for Overdue Todo Items

## Persistent entities

No changes. The `todos` table and API responses are unchanged.

### Todo (existing, as returned by the API)

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | Unique identifier |
| `title` | string | Required, max 255 chars |
| `dueDate` | string \| null | Calendar date `YYYY-MM-DD`, no time of day; optional |
| `completed` | number | `0` = incomplete, `1` = complete |
| `createdAt` | string | ISO timestamp |

## Derived values (not stored)

### Current local date (`today`)

- Type: string `YYYY-MM-DD`, built from the browser's local year/month/day.
- Owned by `App` through `useCurrentDate`; updated on reload, tab visibility, or window focus.

### Days overdue

```text
daysOverdue(todo, today) =
  0                                   if todo.completed is truthy
  0                                   if todo.dueDate is null/empty/invalid
  max(0, wholeDays(today - dueDate))  otherwise
```

- `wholeDays` = difference of the two calendar dates in days (DST-safe).
- A todo is **overdue** if and only if `daysOverdue(todo, today) >= 1`.

### Overdue count

```text
overdueCount(todos, today) = number of todos where isOverdue(todo, today)
```

## State transitions

Overdue is a pure function of `(dueDate, completed, today)`, so it changes whenever one input changes:

| Event | Effect |
|-------|--------|
| Todo marked complete | Becomes not overdue |
| Completed todo marked incomplete with past due date | Becomes overdue |
| Due date edited to today/future or cleared | Becomes not overdue |
| Due date edited to a past date (incomplete todo) | Becomes overdue |
| Todo created with past due date | Overdue immediately |
| Todo deleted | Removed from count |
| Local date changes (observed on reload/tab focus) | Day count increases; due-yesterday todos become overdue |

## Validation rules

- `dueDate` must match `^\d{4}-\d{2}-\d{2}$` and represent a real calendar date; otherwise treated as not overdue.
- Overdue label text: `Overdue by 1 day` when `daysOverdue === 1`, else `Overdue by N days`.
- Header summary text: `N overdue`, rendered only when `N >= 1`.

# Contracts: Overdue Todo Items (UI & module interfaces)

The feature adds no HTTP endpoints; the existing REST API contract is unchanged. The interfaces
that matter are the new frontend modules and component props below.

## `src/utils/overdue.js`

All functions are pure and take `today` explicitly.

| Function | Signature | Behavior |
|----------|-----------|----------|
| `getLocalDateString` | `(date = new Date()) => string` | Returns local `YYYY-MM-DD` |
| `getDaysOverdue` | `(todo, today) => number` | Whole days overdue; `0` if completed, undated, invalid, due today, or future |
| `isOverdue` | `(todo, today) => boolean` | `getDaysOverdue(todo, today) >= 1` |
| `countOverdue` | `(todos, today) => number` | Count of overdue todos |
| `formatOverdueLabel` | `(days) => string` | `"Overdue by 1 day"` / `"Overdue by N days"` |

### Behavior examples (today = `2026-10-19`)

| Todo | Result |
|------|--------|
| `{ dueDate: '2026-10-18', completed: 0 }` | `getDaysOverdue` → `1` |
| `{ dueDate: '2026-10-19', completed: 0 }` | `0` (due today) |
| `{ dueDate: '2026-10-20', completed: 0 }` | `0` (future) |
| `{ dueDate: null, completed: 0 }` | `0` (no due date) |
| `{ dueDate: '2026-10-01', completed: 1 }` | `0` (completed) |
| `{ dueDate: '2025-09-14', completed: 0 }` | `400` |
| `{ dueDate: 'not-a-date', completed: 0 }` | `0` (invalid) |

## `src/hooks/useCurrentDate.js`

`useCurrentDate() => string` returns the local `YYYY-MM-DD`. It re-evaluates on window `focus` and
document `visibilitychange` (when visible), updates state only if the value changed, and removes
its listeners on unmount.

## Component props

### `TodoCard`

Adds optional `today` (string `YYYY-MM-DD`, default `getLocalDateString()`).

When the todo is overdue, the non-editing card renders:

- Root element has class `overdue` (in addition to existing classes).
- The due-date paragraph has class `overdue`.
- Below the due date: `<p class="todo-overdue-label">` containing an `aria-hidden` icon `⚠️` and the
  text from `formatOverdueLabel`.

When not overdue, markup is identical to today's output.

### `TodoList`

Adds optional `today` and forwards it to each `TodoCard`. Ordering is unchanged.

### `OverdueSummary`

| Prop | Type | Description |
|------|------|-------------|
| `count` | number | Number of overdue todos |

- `count < 1` → renders nothing.
- `count >= 1` → `<span class="overdue-summary" role="status">{count} overdue</span>`.

### `App`

Obtains `today` from `useCurrentDate()`, computes `countOverdue(todos, today)`, renders
`<OverdueSummary>` in `.header-content` before `ThemeToggle`, and passes `today` to `TodoList`.

## Theme/CSS contract

- Overdue due-date and label text use `var(--danger-color)` (both themes).
- `.overdue-summary`: white text on `rgba(0, 0, 0, 0.35)` background, `border-radius: 16px`,
  12px semi-bold, padding on the 8px grid.
- No animation or transition is added.

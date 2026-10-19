# Research: Support for Overdue Todo Items

All Technical Context items were resolvable from the repository; there were no unresolved
`NEEDS CLARIFICATION` markers. The decisions below record the choices that shape the tasks.

## 1. Where overdue status is computed

- **Decision**: Derive at render time in the frontend from `todo.dueDate`, `todo.completed`,
  and the current local date. Do not store it and do not add an API field.
- **Rationale**: Spec FR-008 and the Key Entities section require derived status. Stored
  status would go stale at midnight and need a job to update. The API already returns
  `dueDate` and `completed`, so no backend change is needed.
- **Alternatives considered**: Compute on the backend and return `isOverdue` (adds an API
  change and goes stale between fetches); a database column (violates "no schema changes").

## 2. Date parsing and day arithmetic

- **Decision**: Parse `YYYY-MM-DD` by splitting into numeric year/month/day and compare using
  `Date.UTC(y, m - 1, d)` for both the due date and "today" (also derived from local
  year/month/day). Days overdue = `(todayUTC - dueUTC) / 86400000`.
- **Rationale**: `new Date('2025-12-25')` is parsed as UTC midnight and shifts to the previous
  day in timezones behind UTC, which would make a due-today todo appear overdue. UTC-based
  arithmetic on calendar components also avoids DST 23/25-hour day errors. This yields exact
  whole-calendar-day counts.
- **Alternatives considered**: `new Date(dueDate)` with `setHours(0,0,0,0)` (timezone-sensitive,
  DST-sensitive); adding a date library such as date-fns (new dependency for ~10 lines of logic).
- **Note**: The existing `formatDate` in `TodoCard.js` uses `new Date(dateString)` and can show a
  day-early date in negative-offset timezones. It is a pre-existing issue outside this feature's
  scope and is intentionally not changed here.

## 3. Invalid or missing due dates

- **Decision**: `getDaysOverdue` returns `0` (not overdue) when `dueDate` is null, empty, or not
  a valid `YYYY-MM-DD` string.
- **Rationale**: Spec requires that undated todos are never overdue; failing safe avoids showing
  a misleading indicator or throwing during render (constitution: graceful error handling).
- **Alternatives considered**: Throwing on malformed input (would crash the list).

## 4. Keeping "today" current

- **Decision**: A `useCurrentDate` hook returns the local date string, initialized on mount and
  re-evaluated on `visibilitychange` (tab becomes visible) and window `focus`. It only updates
  state when the date string actually changes.
- **Rationale**: Matches the clarified requirement (refresh on reload or tab refocus, no
  continuous timer). Storing a date string means re-renders happen at most once per day change.
- **Alternatives considered**: `setInterval` polling or a midnight timeout (rejected in
  clarification; adds timers and test complexity); computing `new Date()` inside each card
  (inconsistent across cards in the same render, harder to test).

## 5. Dependency injection of the current date

- **Decision**: `App` owns the date via the hook and passes `today` as a prop through
  `TodoList` to `TodoCard` and to `OverdueSummary`'s count calculation. `today` defaults to the
  real current local date when omitted.
- **Rationale**: The testing guidelines require dependency injection and isolated tests.
  Components can be tested with a fixed date, without mocking global `Date`.
- **Alternatives considered**: Mocking global `Date` in every test (brittle, order-sensitive);
  React context (more machinery than a single prop needs).

## 6. Visual treatment

- **Decision**: On an overdue card: add the `overdue` class (danger-colored due date text), and
  render `<span class="todo-overdue-label"><span aria-hidden>⚠️</span> Overdue by N day(s)</span>`
  beneath the due date. The visible label text is exposed to assistive technologies; the
  decorative icon is `aria-hidden`. Singular "1 day", plural otherwise.
- **Rationale**: Satisfies FR-003/FR-004 (icon + text + color), reuses the existing
  `--danger-color` token for both themes (UI guidelines list Danger `#c62828` light /
  `#ef5350` dark). Both exceed WCAG AA 4.5:1 against the surface colors (`#ffffff` and
  `#2d2d2d`); this will be confirmed in the quickstart check.
- **Alternatives considered**: Whole-card red background (heavier, hurts completed/hover states);
  tooltip-only day count (clarification chose a visible label).

## 7. Header summary

- **Decision**: New `OverdueSummary` component placed in the header next to the theme toggle.
  Renders `null` when count is 0; otherwise a pill reading "N overdue" with `role="status"`.
  Styling is white text on a dark translucent background (`rgba(0, 0, 0, 0.35)`).
- **Rationale**: The header uses an orange-to-blue gradient, where danger red would have poor
  contrast; a dark pill with white text keeps AA contrast on both ends of the gradient and in
  both themes. `role="status"` announces count changes politely.
- **Alternatives considered**: Danger-colored text in the header (insufficient contrast on the
  orange end); placing the count above the list (clarification specified the header).

## 8. Testing approach

- **Decision**: Pure-function unit tests with explicit `today` strings (no timer mocking);
  component tests with an injected `today`; hook tests that change the system date via Jest
  modern fake timers (`doNotFake` for timer APIs that React Testing Library needs) and dispatch
  `visibilitychange`/`focus`; App integration tests with `msw`, using dates computed relative to
  the real current date through a shared test helper.
- **Rationale**: Follows existing patterns (`__tests__/` colocated, `msw` in `App.test.js`,
  Arrange-Act-Assert) and keeps boundary tests (past, today, future, none, completed) deterministic.
- **Alternatives considered**: Hard-coded absolute dates in App tests (would start failing as time passes).

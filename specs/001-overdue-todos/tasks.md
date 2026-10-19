---

description: "Task list for Support for Overdue Todo Items"
---

# Tasks: Support for Overdue Todo Items

**Input**: Design documents from `/specs/001-overdue-todos/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-components.md, quickstart.md

**Tests**: REQUIRED. FR-010 and the spec's Testing section explicitly require automated Jest tests. Test tasks come before their implementation tasks (Red-Green-Refactor, per constitution principle III).

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story the task belongs to (US1, US2, US3)
- All source paths are relative to the repository root. The backend (`packages/backend/`) requires **no changes**.

## Path Conventions

- Frontend source: `packages/frontend/src/`
- Tests are colocated in `__tests__/` directories as `{filename}.test.js`
- Run frontend tests with `npm run test:frontend` (from the repo root)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm a green baseline and create shared test fixtures

- [ ] T001 Run `npm run test:frontend` and confirm the existing suite passes before any changes (baseline for packages/frontend)
- [ ] T002 [P] Create shared date test helpers in `packages/frontend/src/__mocks__/dateHelpers.js` exporting `daysFromToday(offset)` (returns a local `YYYY-MM-DD` string for today + offset days) so tests never hard-code absolute dates

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The pure date logic and current-date hook that every user story depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [P] Write failing unit tests in `packages/frontend/src/utils/__tests__/overdue.test.js` for `getLocalDateString`, `getDaysOverdue`, `isOverdue`, `countOverdue`, and `formatOverdueLabel` covering: past (1 day and 400 days), due today, future, no due date (`null` and `''`), completed (`completed: 1`), invalid date string, month/year boundaries, DST-transition dates, and singular/plural label text (FR-001, FR-002, FR-010)
- [ ] T004 [P] Write failing hook tests in `packages/frontend/src/hooks/__tests__/useCurrentDate.test.js` covering: returns the local date on mount, updates after the system date changes and `visibilitychange` (visible) or window `focus` fires, does not change state when the date is unchanged, and removes listeners on unmount (FR-008)
- [ ] T005 Implement `packages/frontend/src/utils/overdue.js` exporting `getLocalDateString`, `getDaysOverdue`, `isOverdue`, `countOverdue`, `formatOverdueLabel` per `contracts/ui-components.md`, using `Date.UTC` calendar arithmetic and JSDoc for each function; make T003 pass
- [ ] T006 Implement `packages/frontend/src/hooks/useCurrentDate.js` (uses `getLocalDateString` from `../utils/overdue`; listens to `focus` and `visibilitychange`; updates only when the value changes; cleans up on unmount); make T004 pass

**Checkpoint**: Foundation ready — overdue logic and current date are tested and available to the UI

---

## Phase 3: User Story 1 - Spot overdue todos at a glance (Priority: P1) 🎯 MVP

**Goal**: Every incomplete todo with a past due date shows an icon, an "Overdue by N day(s)" label, and a danger-colored due date; the header shows an "N overdue" summary that is hidden when N is 0.

**Independent Test**: Create todos with past, today, future, and no due dates. Only the past-dated incomplete todo shows the indicator, and the header shows "1 overdue". With no overdue todos, the header summary is absent.

### Tests for User Story 1 ⚠️ (write first; they MUST fail before implementation)

- [ ] T007 [P] [US1] Add overdue display tests to `packages/frontend/src/components/__tests__/TodoCard.test.js`: past due shows "Overdue by N days" text, singular "Overdue by 1 day", `overdue` class on card and due date, icon is `aria-hidden`; due today, future, and no due date show no indicator; existing tests still pass (FR-001–FR-004)
- [ ] T008 [P] [US1] Create `packages/frontend/src/components/__tests__/OverdueSummary.test.js`: renders `"3 overdue"` with `role="status"` for count 3, renders `"1 overdue"` for count 1, and renders nothing for count 0 (FR-011)
- [ ] T009 [P] [US1] Add a test to `packages/frontend/src/components/__tests__/TodoList.test.js` that the `today` prop is forwarded so a past-dated todo shows its overdue label while list order is unchanged (FR-009)
- [ ] T010 [US1] Add integration tests to `packages/frontend/src/__tests__/App.test.js` (msw, dates from `daysFromToday`): a mixed list shows labels only on overdue todos, header shows the correct count, header summary is absent when none are overdue, creating a past-dated todo increments the count, and deleting an overdue todo decrements it (FR-003, FR-011, SC-002, SC-006)

### Implementation for User Story 1

- [ ] T011 [P] [US1] Create `packages/frontend/src/components/OverdueSummary.js` (props: `count`; returns `null` when `count < 1`; otherwise `<span className="overdue-summary" role="status">{count} overdue</span>`); make T008 pass
- [ ] T012 [P] [US1] Update `packages/frontend/src/components/TodoCard.js`: accept optional `today` prop (default `getLocalDateString()`), compute `getDaysOverdue`, add `overdue` class to the card and due-date paragraph, and render `<p className="todo-overdue-label"><span aria-hidden="true">⚠️</span> {formatOverdueLabel(days)}</p>` below the due date when overdue; leave non-overdue markup unchanged; make T007 pass
- [ ] T013 [P] [US1] Update `packages/frontend/src/components/TodoList.js` to accept an optional `today` prop and forward it to each `TodoCard` without changing ordering; make T009 pass
- [ ] T014 [US1] Update `packages/frontend/src/App.js`: call `useCurrentDate()`, compute `countOverdue(todos, today)`, render `<OverdueSummary count={...} />` inside `.header-content` before `ThemeToggle`, and pass `today` to `TodoList`; make T010 pass
- [ ] T015 [P] [US1] Add styles to `packages/frontend/src/App.css`: `.todo-due-date.overdue` and `.todo-overdue-label` use `var(--danger-color)` at 12px (caption) semi-bold with 4px top margin; `.overdue-summary` is white 12px semi-bold text on `rgba(0, 0, 0, 0.35)` with `border-radius: 16px`, padding on the 8px grid, and spacing from `ThemeToggle`; no animation or transition; adjust `.header-content` only as needed to keep the layout aligned
- [ ] T016 [US1] Run `npm run test:frontend` and confirm all US1 tests and all pre-existing tests pass

**Checkpoint**: User Story 1 is fully functional and independently testable (MVP)

---

## Phase 4: User Story 2 - Overdue status reflects completion (Priority: P2)

**Goal**: Completing an overdue todo removes its indicator and decrements the header count; reopening it restores both.

**Independent Test**: Mark an overdue todo complete → no label, header count drops; mark incomplete → label and count return.

### Tests for User Story 2 ⚠️

- [ ] T017 [P] [US2] Add tests to `packages/frontend/src/components/__tests__/TodoCard.test.js`: a completed todo with a past due date shows no overdue label or `overdue` class, and re-rendering the same todo with `completed: 0` shows the label (FR-002, FR-006)
- [ ] T018 [US2] Add integration tests to `packages/frontend/src/__tests__/App.test.js`: clicking the checkbox on an overdue todo removes its label and decrements the header count (and hides the summary at 0); clicking it again restores the label and count (FR-006, SC-003)

### Implementation for User Story 2

- [ ] T019 [US2] Run T017 and T018. Overdue status is derived from `completed`, so no new production code is expected; if a test fails, fix the derivation in `packages/frontend/src/utils/overdue.js` or the prop flow in `packages/frontend/src/App.js` and re-run `npm run test:frontend`

**Checkpoint**: User Stories 1 and 2 both work independently

---

## Phase 5: User Story 3 - Overdue status updates when the due date changes (Priority: P3)

**Goal**: Editing or clearing a due date immediately updates the todo's indicator and the header count.

**Independent Test**: Edit an overdue todo's due date to a future date → indicator and count update; edit a future todo to a past date → indicator appears.

### Tests for User Story 3 ⚠️

- [ ] T020 [P] [US3] Add tests to `packages/frontend/src/components/__tests__/TodoCard.test.js`: re-rendering a todo with a changed `dueDate` (past → today, past → future, past → `null`, future → past) updates the overdue label and day count accordingly (FR-007)
- [ ] T021 [US3] Add integration tests to `packages/frontend/src/__tests__/App.test.js`: editing an overdue todo's due date to a future date, and clearing it, removes the label and decrements the header count; editing a non-overdue todo to a past date adds the label and increments the count (FR-007, SC-003)

### Implementation for User Story 3

- [ ] T022 [US3] Run T020 and T021. Overdue status is derived from `dueDate`, so no new production code is expected; if a test fails, fix the derivation or prop flow (`packages/frontend/src/utils/overdue.js`, `packages/frontend/src/App.js`) and re-run `npm run test:frontend`

**Checkpoint**: All three user stories are independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Date rollover, accessibility, coverage, and final validation

- [ ] T023 [P] Add an integration test to `packages/frontend/src/__tests__/App.test.js` that advances the system date by one day and fires `visibilitychange`/`focus`, then asserts a due-today todo now shows "Overdue by 1 day" and the header count updates without a reload (FR-008, SC-003)
- [ ] T024 [P] Verify WCAG AA contrast (≥ 4.5:1) for `.todo-overdue-label`/`.todo-due-date.overdue` on the card surface in light (`#c62828` on `#ffffff`) and dark (`#ef5350` on `#2d2d2d`) themes, and for `.overdue-summary` text over both ends of the header gradient; adjust `packages/frontend/src/App.css` if any pair fails (FR-005, SC-004)
- [ ] T025 Run `npm run test:frontend` and confirm coverage ≥ 80% overall, 100% for `packages/frontend/src/utils/overdue.js`, and that new files `OverdueSummary.js` and `useCurrentDate.js` are fully covered (constitution III, SC-005)
- [ ] T026 [P] Confirm the new and changed files in `packages/frontend/src/` have no lint warnings in the dev-server output, follow import ordering and naming conventions, and contain no `console.log` statements (constitution I and II)
- [ ] T027 Run the manual validation in `specs/001-overdue-todos/quickstart.md` (mixed list, complete/reopen, edit, delete, reload, dark mode, keyboard and screen-reader check, date rollover)
- [ ] T028 Run `npm test` from the repository root and confirm the frontend and backend suites pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup (T002 fixtures used by tests). **Blocks all user stories.**
- **User Story 1 (Phase 3)**: Depends on Foundational. This is the MVP.
- **User Story 2 (Phase 4)**: Depends on User Story 1's UI (card label and header count must exist to be asserted).
- **User Story 3 (Phase 5)**: Depends on User Story 1's UI; independent of User Story 2.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### Task-Level Dependencies

- T005 requires T003 (tests first); T006 requires T004 and T005.
- T012 requires T005; T014 requires T006, T011, T012, T013; T015 must precede T024.
- T010, T018, T021, and T023 all edit `App.test.js`, so they must not run concurrently with each other; likewise T007, T017, and T020 all edit `TodoCard.test.js`.
- T016, T019, T022, and T025–T028 are verification gates and run after the tasks they cover.

### Within Each User Story

- Tests are written first and must fail before implementation.
- Utilities → components → App wiring → styles → verification.

### Parallel Opportunities

- Phase 2: T003 and T004 in parallel.
- US1 tests: T007, T008, T009 in parallel (different files); T010 follows.
- US1 implementation: T011, T012, T013, T015 in parallel (different files); T014 after them.
- US2 and US3 can proceed in parallel after US1 if different people work on them, except for the shared test files noted above.
- Polish: T023, T024, T026 in parallel.

---

## Parallel Example: User Story 1

```text
# Tests (different files):
T007 TodoCard.test.js overdue cases
T008 OverdueSummary.test.js
T009 TodoList.test.js passthrough

# Implementation (different files, after tests exist and fail):
T011 OverdueSummary.js
T012 TodoCard.js
T013 TodoList.js
T015 App.css
# Then: T014 App.js (needs T006, T011, T013), then T016 verification
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational: tested date logic and hook).
2. Complete Phase 3 (User Story 1): card indicator and header summary.
3. **Stop and validate**: run the US1 independent test and `npm run test:frontend`.
4. This already delivers the core value: overdue tasks are identifiable at a glance.

### Incremental Delivery

1. Setup + Foundational → date logic verified.
2. Add User Story 1 → validate → demo (MVP).
3. Add User Story 2 → validate completion/reopen behavior.
4. Add User Story 3 → validate due-date edit behavior.
5. Polish: date rollover test, contrast check, coverage, lint, quickstart, full test run.

### Notes

- Overdue status is derived at render time, so User Stories 2 and 3 are primarily verified by tests; production changes for them are expected to be zero unless a test exposes a gap.
- Commit after each task or logical group (atomic commits, per the coding guidelines).
- Do not change the existing `formatDate` in `TodoCard.js`; its timezone behavior is a pre-existing, out-of-scope issue (see `research.md`).

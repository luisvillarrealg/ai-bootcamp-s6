# Implementation Plan: Support for Overdue Todo Items

**Branch**: `001-overdue-todos` | **Date**: 2026-10-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-overdue-todos/spec.md`

## Summary

Show which todos are overdue. An incomplete todo whose due date is before the current local
date gets an icon, an "Overdue by N day(s)" label, and a danger-colored due date on its card.
The page header shows a total "N overdue" summary that is hidden when N is zero.

Approach: a frontend-only change. Overdue status is **derived at render time** from the
existing `dueDate` and `completed` fields and the current local date, so there are no backend,
schema, or API changes. Date logic lives in one pure utility module (DRY, easily unit
tested). The "current date" is held in a small hook that refreshes when the page is reloaded or
the tab regains focus, and is passed down as a prop so tests can inject any date.

## Technical Context

**Language/Version**: JavaScript (ES2020+), React 18.2, Node.js 16+

**Primary Dependencies**: React, React DOM, react-scripts 5.0.1 (existing); no new dependencies

**Storage**: N/A — overdue state is derived, never stored; existing SQLite-backed Express API is unchanged

**Testing**: Jest via `react-scripts test`, `@testing-library/react`, `@testing-library/user-event`, `msw` (all existing)

**Target Platform**: Desktop web browsers (Chrome/Firefox/Safari current versions)

**Project Type**: Web application (npm-workspaces monorepo: `packages/frontend`, `packages/backend`)

**Performance Goals**: Overdue evaluation is O(n) over the todo list per render; imperceptible at expected list sizes (hundreds of todos)

**Constraints**: Local-date semantics (due today ≠ overdue); no color-only indication; works in light and dark themes; no continuous timers; no ordering/filtering changes

**Scale/Scope**: Single-user app; 1 new utility module, 1 new hook, 1 new component, edits to 3 existing components + CSS

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Code Quality & Simplicity | DRY: all date/overdue logic in one utility; SRP: card renders, hook tracks date, utility computes; no premature optimization; error-safe on invalid dates | PASS |
| II. Conventions & Structure | camelCase/PascalCase naming, file name = component name, import order, files under `packages/frontend/src/{components,utils,hooks}` | PASS |
| III. Test-First (NON-NEGOTIABLE) | Tests specified for utility, hook, card, list, summary, and App integration; colocated `__tests__/`; ≥80% coverage, 100% on overdue workflow | PASS |
| IV. Scope Discipline | Only overdue indicator + header count (both in clarified spec); no filtering, sorting, notifications, or schema change | PASS |
| V. Consistent, Accessible UI | Reuses theme variables (`--danger-color`), 8px spacing grid, 12px caption type; text + icon, not color alone; WCAG AA contrast in both themes; minimal motion | PASS |

**Post-design re-check (after Phase 1)**: All gates still PASS. No complexity violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-overdue-todos/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── ui-components.md # Phase 1 output (component/utility contracts)
├── checklists/
│   └── requirements.md  # Created by /speckit-specify
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
packages/frontend/src/
├── App.js                          # EDIT: use useCurrentDate, count overdue, render OverdueSummary, pass today
├── App.css                         # EDIT: .overdue-summary, .todo-card.overdue, .todo-overdue-label styles
├── components/
│   ├── TodoCard.js                 # EDIT: accept `today`; render overdue label/icon/class
│   ├── TodoList.js                 # EDIT: pass `today` through to TodoCard
│   ├── OverdueSummary.js           # NEW: header "N overdue" pill (hidden when 0)
│   └── __tests__/
│       ├── TodoCard.test.js        # EDIT: overdue display cases
│       ├── TodoList.test.js        # EDIT: `today` passthrough case
│       └── OverdueSummary.test.js  # NEW
├── hooks/
│   ├── useCurrentDate.js           # NEW: local date string; refreshes on tab focus
│   └── __tests__/
│       └── useCurrentDate.test.js  # NEW
├── utils/
│   ├── overdue.js                  # NEW: getLocalDateString, getDaysOverdue, isOverdue, countOverdue, formatOverdueLabel
│   └── __tests__/
│       └── overdue.test.js         # NEW
└── __tests__/
    └── App.test.js                 # EDIT: end-to-end overdue behavior via msw

packages/backend/                   # NO CHANGES
```

**Structure Decision**: Frontend-only change within the existing web-application monorepo.
New files follow the repo's existing flat `components/` layout and add `utils/` and `hooks/`
folders, which the coding guidelines already anticipate (`utils/`) or that follow the same
colocated-`__tests__/` convention (`hooks/`). The backend is untouched because overdue status
is derived from fields the API already returns.

## Complexity Tracking

No Constitution Check violations; nothing to justify.

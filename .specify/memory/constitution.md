<!--
Sync Impact Report
Version change: (template, unversioned) → 1.0.0
Modified principles: none renamed (all template placeholders replaced with concrete principles)
  - Principle 1 → I. Code Quality & Simplicity
  - Principle 2 → II. Consistent Conventions & Structure
  - Principle 3 → III. Test-First Development (NON-NEGOTIABLE)
  - Principle 4 → IV. Scope Discipline (Single-User Todo App)
  - Principle 5 → V. Consistent, Accessible UI
Added sections: Technology & Architecture Constraints; Development Workflow & Quality Gates
Removed sections: none
Templates requiring updates: none modified here (templates read the constitution at runtime)
Follow-up TODOs: none. Ratification date set to the adoption date of this constitution.
-->
# Copilot Bootcamp Todo App Constitution

## Core Principles

### I. Code Quality & Simplicity
Code MUST be simple, readable, and free of duplication.
- Apply DRY: shared logic MUST be extracted into utilities or reusable components.
- Apply KISS: prefer the simplest solution; premature optimization is prohibited.
- Apply SOLID, especially Single Responsibility: a module, component, or function MUST have one
  reason to change (e.g., `TodoCard` only displays a todo; it does not fetch or delete it).
- Errors MUST be handled explicitly (try/catch around fallible operations) with meaningful
  messages surfaced to the user, and input MUST be validated at API boundaries.
- Comments MUST explain "why", not "what"; public functions SHOULD carry JSDoc.
- `console.log` statements MUST NOT remain in production code.

Rationale: Simple, single-purpose code is cheaper to test, review, and change.
Source: `docs/coding-guidelines.md`.

### II. Consistent Conventions & Structure
All code MUST follow the project's naming, formatting, and organization conventions.
- Formatting: 2-space indentation, LF line endings, no trailing whitespace, lines ideally
  under 100 characters.
- Naming: `camelCase` for variables/functions, `UPPER_SNAKE_CASE` for constants, `PascalCase`
  for classes and React components (file name MUST match the component name).
- Imports MUST be ordered: external libraries, internal modules, then styles, with a blank line
  between groups; internal imports use relative paths; circular dependencies are prohibited.
- Frontend code lives under `packages/frontend/src/` (components, services, utils) and backend
  code under `packages/backend/src/` (routes, controllers, services, middleware).
- ESLint errors and warnings MUST be resolved before a pull request is opened.

Rationale: Predictable structure and style reduce cognitive load and review friction.
Source: `docs/coding-guidelines.md`.

### III. Test-First Development (NON-NEGOTIABLE)
Tests MUST be written before or alongside implementation, following Red-Green-Refactor.
- Overall coverage MUST reach 80%+; critical user workflows MUST have 100% coverage.
- Unit and integration tests are required using Jest (and `@testing-library/react` for the
  frontend). End-to-end tests are out of scope for now.
- Tests MUST be colocated in `__tests__/` directories, named `{filename}.test.js`, follow
  Arrange-Act-Assert, and verify behavior rather than implementation details.
- Tests MUST be isolated and order-independent; external dependencies (API calls, timers)
  MUST be mocked, and shared fixtures live in `__mocks__/` or `fixtures/`.
- Every bug fix MUST be accompanied by a test that fails before the fix.
- All tests (`npm test`) MUST pass before a pull request is created.

Rationale: Tests document expected behavior and make refactoring safe.
Source: `docs/testing-guidelines.md`.

### IV. Scope Discipline (Single-User Todo App)
Features MUST satisfy `docs/functional-requirements.md` and MUST NOT exceed its scope.
- Supported: create (title ≤ 255 chars, optional due date), view (newest first), toggle
  completion, edit title/due date, and delete with a confirmation dialog.
- All changes MUST persist immediately through the Express.js backend API and survive a
  page refresh.
- Out of scope unless the requirements document is amended first: authentication, multi-user
  support, priorities/categories/tags, recurring todos, reminders, undo/redo, bulk operations,
  filtering/search, and mobile-specific optimization.
- Persistence MUST NOT require schema changes beyond basic todo storage.

Rationale: A narrowly scoped app stays simple and verifiable against its success criteria.
Source: `docs/functional-requirements.md`, `docs/project-overview.md`.

### V. Consistent, Accessible UI
The interface MUST follow `docs/ui-guidelines.md`.
- Use the defined Halloween-themed Material Design palette for both light and dark modes, the
  system font stack, the typography scale, and the 8px spacing grid.
- Layout is a single column with a 600px max width; the todo list shows the defined empty
  state; deletes use the specified confirmation dialog.
- Dark/light mode MUST default to the system preference and persist the user's choice in
  `localStorage`.
- Interactive elements MUST be keyboard accessible with visible focus indicators, form inputs
  MUST have associated labels, icon buttons MUST have `aria-label`/title, and color contrast
  MUST meet WCAG AA.
- Motion MUST be minimal to none.

Rationale: A consistent, accessible interface is usable by everyone and avoids design drift.
Source: `docs/ui-guidelines.md`.

## Technology & Architecture Constraints

- Monorepo using npm workspaces: `packages/frontend` (React, React DOM, CSS) and
  `packages/backend` (Node.js, Express.js REST API). Jest is the test framework for both.
- Node.js v16+ and npm v7+ are the supported runtime baseline.
- The frontend MUST communicate with the backend only through the REST API.
- Dependencies MUST be injected (props/context) rather than hardcoded to keep code testable.
- Performance work (e.g., `useMemo`, `useCallback`, lazy loading) MUST be justified by need.

## Development Workflow & Quality Gates

- Work happens on feature branches (e.g., `feature/todo-editing`) and is merged via pull
  requests reviewed against this constitution.
- Commits MUST be atomic with descriptive messages explaining the "why"
  (e.g., `feat: add ability to edit todo title and due date`).
- Before requesting review, the code review checklist in `docs/coding-guidelines.md` MUST be
  satisfied: conventions followed, imports organized, no lint errors, DRY, single
  responsibility, error handling, tests written, atomic commits, no stray `console.log`.
- Spec-driven work MUST follow the SpecKit flow: specify → clarify → plan → tasks →
  analyze → implement, and plans MUST pass a Constitution Check against this document.

## Governance

This constitution supersedes other practices where they conflict. The detailed guidance in
`docs/coding-guidelines.md`, `docs/testing-guidelines.md`, `docs/ui-guidelines.md`,
`docs/functional-requirements.md`, and `docs/project-overview.md` is the runtime reference
for applying these principles.

- **Amendments**: Changes MUST be proposed via pull request that updates this file, includes
  an updated Sync Impact Report, and is approved by a maintainer. Changes to dependent
  documentation or templates MUST be made in the same pull request when affected.
- **Versioning**: Semantic versioning applies. MAJOR for backward-incompatible principle
  removals or redefinitions; MINOR for new principles/sections or materially expanded
  guidance; PATCH for clarifications and wording fixes.
- **Compliance**: Every pull request and plan review MUST verify compliance. Any deviation
  MUST be explicitly justified in the plan or pull request description.

**Version**: 1.0.0 | **Ratified**: 2026-10-19 | **Last Amended**: 2026-10-19

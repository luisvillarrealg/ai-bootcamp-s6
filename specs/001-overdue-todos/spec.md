# Feature Specification: Support for Overdue Todo Items

**Feature Branch**: `001-overdue-todos`

**Created**: 2026-10-19

**Status**: Draft

**Input**: User description: "Support for Overdue Todo Items — As a todo application user, I want to easily identify and distinguish overdue tasks in my todo list, so that I can prioritize my work and quickly see which tasks are past their due date. Users need a clear, visual way to identify which todos have not been completed by their due date, without manually checking dates against today's date. This feature must include automated tests covering the overdue determination logic and its display, following the existing Jest patterns in the repository."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Spot overdue todos at a glance (Priority: P1)

As a user viewing my todo list, I see a clear visual indication on every todo that is past its due date and not yet completed, so I can immediately tell which tasks need attention without comparing dates myself.

**Why this priority**: This is the core value of the feature. Without a visible overdue indicator, the feature delivers nothing.

**Independent Test**: Create a todo with a due date in the past, leave it incomplete, and view the list. The todo is visibly marked as overdue, while todos with future or no due dates are not.

**Acceptance Scenarios**:

1. **Given** an incomplete todo whose due date is before today, **When** the user views the todo list, **Then** that todo is visually distinguished as overdue.
2. **Given** an incomplete todo whose due date is today, **When** the user views the todo list, **Then** the todo is not marked as overdue.
3. **Given** an incomplete todo whose due date is in the future, **When** the user views the todo list, **Then** the todo is not marked as overdue.
4. **Given** an incomplete todo with no due date, **When** the user views the todo list, **Then** the todo is not marked as overdue.
5. **Given** a list containing both overdue and non-overdue todos, **When** the user views the list, **Then** overdue todos are clearly distinguishable from all others.

---

### User Story 2 - Overdue status reflects completion (Priority: P2)

As a user, when I complete an overdue todo it stops being shown as overdue, and if I mark it incomplete again it is shown as overdue again, so the indicator always reflects work that is genuinely outstanding.

**Why this priority**: Prevents misleading indicators on finished work, keeping the signal trustworthy. It builds on the P1 indicator.

**Independent Test**: Mark an overdue todo complete and confirm the overdue indication disappears; mark it incomplete and confirm it returns.

**Acceptance Scenarios**:

1. **Given** an overdue todo, **When** the user marks it complete, **Then** the overdue indication is removed.
2. **Given** a completed todo whose due date is in the past, **When** the user views the list, **Then** it is not marked as overdue.
3. **Given** a completed todo with a past due date, **When** the user marks it incomplete, **Then** it is marked as overdue.

---

### User Story 3 - Overdue status updates when the due date changes (Priority: P3)

As a user, when I edit a todo's due date, its overdue indication updates immediately to match the new date, so I can reschedule work and see the result right away.

**Why this priority**: Keeps the indicator consistent with the existing edit capability, but the feature is already useful without it.

**Independent Test**: Edit an overdue todo's due date to a future date and confirm the overdue indication disappears; edit a non-overdue todo to a past date and confirm it appears.

**Acceptance Scenarios**:

1. **Given** an overdue todo, **When** the user changes its due date to today or a future date, **Then** the overdue indication is removed.
2. **Given** an incomplete todo with a future due date, **When** the user changes its due date to a past date, **Then** the todo is marked as overdue.
3. **Given** an overdue todo, **When** the user clears its due date, **Then** the overdue indication is removed.

---

### Edge Cases

- A todo due today is not overdue until the day has ended; it becomes overdue starting the next calendar day.
- A todo that becomes overdue while the page remains open (for example, across midnight) is shown as overdue after the list is next refreshed or the day changes.
- A todo with no due date is never overdue.
- A completed todo is never shown as overdue, regardless of its due date.
- An overdue todo with a very old due date (months or years ago) is treated the same as one that is a single day overdue.
- Overdue indication is conveyed by more than color alone, so users who cannot distinguish colors can still identify overdue todos.
- Overdue indication is visible and legible in both light and dark modes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST treat a todo as overdue when it is incomplete, has a due date, and that due date is earlier than the current calendar date.
- **FR-002**: The system MUST NOT treat a todo as overdue when it is completed, has no due date, or has a due date of today or later.
- **FR-003**: Users MUST be able to visually distinguish overdue todos from non-overdue todos in the todo list at a glance.
- **FR-004**: The overdue indication MUST NOT rely on color alone; it MUST include at least one additional non-color cue (such as a text label or icon) that is also available to assistive technologies.
- **FR-005**: The overdue indication MUST remain clearly visible in both light and dark modes and consistent with the existing application look and feel.
- **FR-006**: The system MUST update a todo's overdue indication immediately when the user marks it complete or incomplete.
- **FR-007**: The system MUST update a todo's overdue indication immediately when the user edits or clears its due date.
- **FR-008**: Overdue status MUST be determined from the todo's due date and completion state at display time, so that it always reflects the current date.
- **FR-009**: The overdue indication MUST NOT change the existing ordering of todos in the list.
- **FR-010**: The feature MUST include automated tests covering the overdue determination logic (including the due-today, future, no-due-date, and completed boundaries) and the display of the overdue indication, following the existing Jest testing patterns in the repository.

### Key Entities

- **Todo**: A task with a title, an optional due date, and a completion status. Whether a todo is overdue is derived from its due date, its completion status, and the current date; it is not stored separately.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a list containing a mix of overdue and non-overdue todos, a user can correctly identify every overdue todo within 5 seconds, without reading or comparing any dates.
- **SC-002**: 100% of incomplete todos with a due date before today are shown as overdue, and 0% of completed, undated, due-today, or future-dated todos are shown as overdue.
- **SC-003**: After a user completes a todo, changes its completion state, or edits its due date, the overdue indication reflects the new state immediately, with no page reload required.
- **SC-004**: The overdue indication meets the application's existing accessibility standard, remaining distinguishable for users who cannot perceive color differences and legible in both light and dark modes.
- **SC-005**: Automated tests cover all overdue determination rules (past, today, future, no due date, completed) and the displayed indication, and all tests pass.

## Assumptions

- "Overdue" is evaluated against the user's current local calendar date; due dates carry no time of day, so a todo due today is not overdue until the following day.
- The feature applies to the existing single-user todo list; no new user types, permissions, or screens are introduced.
- Overdue status is derived on display and does not require any new stored data or changes to how todos are persisted.
- The overdue indication is presented within each todo's existing card in the list; no new filtering, sorting, grouping, notifications, or reminders are included, consistent with the application's out-of-scope items.
- The existing look and feel (Halloween theme, light and dark modes) and the danger/attention color from the design system are reused for the indication.
- Existing create, view, complete, edit, and delete behaviors remain unchanged.

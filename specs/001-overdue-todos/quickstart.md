# Quickstart: Validating Overdue Todo Items

Use this guide after implementation to prove the feature works end to end.

## Prerequisites

- Dependencies installed (`npm run install:all`, or `npm install` at the repo root).
- On branch `001-overdue-todos`.

## 1. Automated tests

```bash
npm run test:frontend
```

Expected: all suites pass, including `overdue.test.js`, `useCurrentDate.test.js`,
`OverdueSummary.test.js`, and the updated `TodoCard`, `TodoList`, and `App` tests. Coverage for
the new modules is at or above 80%, with 100% on `utils/overdue.js`.

## 2. Manual check

```bash
npm start
```

Frontend: <http://localhost:3000>; backend API: <http://localhost:3030>.

Create these todos (use dates relative to today):

| Title | Due date | Completed | Expected |
|-------|----------|-----------|----------|
| Past | 3 days ago | No | ⚠️ "Overdue by 3 days", red due date |
| Yesterday | 1 day ago | No | "Overdue by 1 day" |
| Today | today | No | No overdue indicator |
| Future | tomorrow | No | No overdue indicator |
| No date | (none) | No | No overdue indicator |
| Done | 5 days ago | Yes | No overdue indicator |

Then verify:

1. The header shows **"2 overdue"** (Past and Yesterday).
2. Mark "Past" complete → its indicator disappears and the header shows **"1 overdue"**.
3. Mark it incomplete → indicator and **"2 overdue"** return.
4. Edit "Yesterday" to a future date → header shows **"1 overdue"**; edit it to a past date → count rises again.
5. Delete the remaining overdue todos → the header summary disappears.
6. Reload the page → state is the same (nothing stored beyond the existing todo fields).
7. Toggle dark mode → label, red due date, and header pill remain legible.
8. Tab through the page → controls remain keyboard accessible; a screen reader announces the
   overdue label text.

## 3. Date rollover check

In browser dev tools, change the system date to tomorrow (or leave the tab hidden past midnight),
then refocus the tab. Expected: due-yesterday and due-today todos update to the new day counts
without a manual reload.

## 4. Quality gates

```bash
npm test
```

Expected: frontend and backend suites pass; no lint warnings in the dev server output.

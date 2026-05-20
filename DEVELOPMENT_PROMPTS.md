# Development prompts log

A record of prompts used with AI assistants (Cursor / Claude) while building **CMP9134 — NexusGrid** (robot control API + React dashboard).  
Use this for coursework reflection or appendix documentation.

**Tool:** Cursor in-editor agent (Composer) and Claude Code, across May 2026.

---

## Backend & API

| # | Prompt (summary) | What was done |
|---|------------------|---------------|
| 1 | Explore the codebase: stack, progress, gaps vs assessment brief | Module map, gap list (tests, CI, admin routes, telemetry UI) |
| 2 | Cross-check assessment brief PDF against the codebase | Feature checklist vs implementation |
| 3 | Fix admin role endpoint not reachable | Admin router registered on the API |
| 4 | Debug refresh-token test returning 401 | Trailing-slash redirect dropped cookies; tests fixed |
| 5 | Add happy-path tests for auth, audit-log, admin, map, robot | Test suite with commander fixture and mocks |
| 6 | Add integration tests against real robot + Redis | Integration tests + test compose services |
| 7 | Confirm the stack runs from Docker (frontend + backend) | Compose verification, env and health checks |
| 8 | Auth not working — use MongoDB, fix COMMANDER/VIEWER permissions, seed default commander | Mongoose + MongoDB, role middleware, `seed.ts`, HttpOnly refresh cookie |
| 9 | Continue unfinished auth / frontend work | Completed cookie auth, login redesign, docs |
| 10 | Write backend tests with Jest | 17 tests (unit + API), in-memory Mongo, `tests/README.md` |
| 11 | Fix `Cannot find name 'expect'` in Jest tests | `tests/tsconfig.json` with `@types/jest` |

---

## Frontend

| # | Prompt (summary) | What was done |
|---|------------------|---------------|
| 1 | Point frontend at the Node API; light design polish | API client, roles, dashboard styling |
| 2 | Audit log table should show `user.full_name` not raw IDs | TypeScript types + table column |
| 3 | Show telemetry link state (connecting / reconnecting / lost) | Connection status in dashboard UI |
| 4 | Dashboard: white theme, controls on the right | Light dashboard shell + right rail |
| 5 | UI changes not visible in browser | Docker frontend rebuild + cache headers |
| 6 | Finer, responsive layout | Mobile drawer, breakpoints, component split |
| 7 | Different robot grid design + new robot icon + sticky battery/status bar | Blueprint map, rover icon, `TelemetryBar` |
| 8 | Fit everything on one screen without scrolling | `100dvh` layout, map scales to viewport |
| 9 | Remove duplicate bottom navigation bar | Bottom dock removed; nav only in side panel |
| 10 | Redesign register page; rename app from RoboControl | **NexusGrid** brand, teal register split layout |
| 11 | Redesign audit log page with white background | Light audit page matching dashboard |
| 12 | Run backend and frontend | `docker compose up` — ports 8080 / 8000 |

---

## Documentation & housekeeping

| # | Prompt (summary) | What was done |
|---|------------------|---------------|
| 1 | Short markdown explaining the Jest tests | `backend/tests/README.md` |
| 2 | Replace `AI_USAGE.md` with a prompt log (no migration narrative) | This file |

---

## How to run the project

```bash
docker compose up -d
```

- Frontend: http://localhost:8080  
- Default commander: `commander@robocontrol.local` / `commander123`  
- Tests: `cd backend && npm test`

---

## Notes for assessors

- Robot movement logic and core JWT auth flows were implemented manually; AI was used mainly for UI, tests, integration fixes, and documentation.
- Prompts are paraphrased for readability; exact wording may differ slightly in chat history.

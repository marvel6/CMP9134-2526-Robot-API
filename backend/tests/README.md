# Backend tests

Short guide to the Jest test suite for the Node.js API.

## Run

```bash
cd backend
npm test              # all tests
npm run test:coverage # with coverage report
```

Requires Node 20. No Docker, MongoDB, or Redis needed for the test run.

## How it works

| Piece | Role |
|-------|------|
| **Jest + ts-jest** | Runs TypeScript tests |
| **Supertest** | Sends HTTP requests to the Express app (no real server port) |
| **mongodb-memory-server** | Starts a temporary in-memory MongoDB for API tests |
| **Mocks** | Redis and the robot HTTP API are mocked in robot tests only |

Before each test, all collections are cleared so tests stay independent.

## Layout

```
tests/
├── setup.ts              # Connect DB; wipe data after each test
├── globalSetup.ts        # Start in-memory Mongo; set env vars
├── helpers.ts            # registerUser, registerCommander, bearer()
├── unit/                 # Pure logic (no HTTP)
│   ├── paginator.test.ts
│   └── robot-position.test.ts
└── api/                  # HTTP endpoints
    ├── health.test.ts
    ├── auth.test.ts
    ├── audit-log.test.ts
    └── robot.test.ts
```

## What is tested

### Unit (`tests/unit/`)

- **paginator** — `page` / `limit` query parsing (defaults, invalid values)
- **robot-position** — `calculateNewPosition` moves correctly and stops at map edges (0–20)

### API (`tests/api/`)

- **health** — `GET /v1/health/` and `/healthz` return 200
- **auth** — register, duplicate email, login, session, refresh cookie, logout
- **audit-log** — viewers get 403; commanders get paginated logs with user names; unauthenticated get 401
- **robot** — viewers cannot move; commanders can move (Redis + axios mocked)

## Helpers

- `registerUser()` — creates a **VIEWER** via `/v1/auth/register`
- `registerCommander()` — same, then promotes role to **COMMANDER** in the DB
- `bearer(accessToken)` — `Authorization` header for protected routes

## CI

Tests run in GitHub Actions after `npm run build` (see `.github/workflows/deploy.yml`).

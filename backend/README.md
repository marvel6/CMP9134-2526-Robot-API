# cmp9134-2526 backend

Node.js / TypeScript service that powers the RoboControl frontend. Exposes the
JSON API used by the React app and bridges the robot simulator's telemetry
WebSocket out to connected browsers.

## Stack

- **Runtime:** Node 20, TypeScript
- **HTTP:** Express 4 + Zod validation
- **DB:** Sequelize 6 against Postgres. `sequelize.sync()` runs additively at
  startup, so missing tables are created and existing ones are left untouched.
- **Auth:** `jsonwebtoken` (HS256) + `bcryptjs`. Standard JWT claims —
  `sub`, `type`, `exp`, `iat`, `iss`, `jti`.
- **Cache / Lock:** `ioredis`. `SET ... EX 30 NX` is used as a short-lived
  distributed lock around `move`/`reset` so two operators can't fight for the
  robot.
- **WebSocket:** a single `ws` client subscribes to the simulator's
  `/ws/telemetry` and fans out frames to browser clients on `/v1/robot/`.

## Routes

All under `/v1/` and wrapped in `{ message, data, status_code }`.

| Method | Path                          | Notes                          |
| ------ | ----------------------------- | ------------------------------ |
| GET    | `/v1/health/`                 | health probe                   |
| POST   | `/v1/auth/login`              |                                |
| POST   | `/v1/auth/register`           |                                |
| POST   | `/v1/auth/refresh-token`      | reads `refresh_token` cookie   |
| POST   | `/v1/auth/logout`             | reads `refresh_token` cookie   |
| GET    | `/v1/auth/session`            | Bearer required                |
| GET    | `/v1/map/`                    | Bearer required, cached        |
| POST   | `/v1/robot/move/`             | Bearer + `COMMANDER`           |
| POST   | `/v1/robot/reset/`            | Bearer + `COMMANDER`           |
| WS     | `/v1/robot/`                  | telemetry stream               |
| GET    | `/v1/audit-log/`              | Bearer + `COMMANDER`           |
| POST   | `/v1/admin/user/:id/role`     | Bearer + `COMMANDER`           |

## Local development

```bash
npm install
npm run dev   # ts-node-dev with auto-restart
```

Required environment (see `.env.example` at the repo root):

```
PORT=8000
JWT_SECRET_KEY=secret
DATABASE_URL=postgresql://user:pass@localhost:5432/db
REDIS_URL=redis://localhost:6379/0
BASE_ROBOT_API_URL=http://localhost:5555
CORS_ORIGINS=*
```

## Production build

```bash
npm run build
npm start
```

The `Dockerfile` builds in two stages and is wired into `../docker-compose.yaml`
as the `backend` service.

# cmp9134-2526 backend

Node.js / TypeScript service powering the RoboControl frontend.

## Stack

- **Runtime:** Node 20, TypeScript
- **HTTP:** Express 4 + Zod validation
- **DB:** MongoDB via Mongoose. Collections: `users`, `refresh_tokens`,
  `audit_logs`.
- **Auth:** `jsonwebtoken` (HS256) + `bcryptjs`. Refresh tokens stored in an
  HttpOnly cookie set by the server on login/register/refresh, plus persisted
  in `refresh_tokens` so they can be revoked on logout.
- **Cache / Lock:** `ioredis`. `SET ... EX 30 NX` short-lived distributed lock
  around `move`/`reset`.
- **WebSocket:** a single `ws` client subscribes to the simulator's
  `/ws/telemetry` and fans frames out to browser clients on `/v1/robot/`.

## Roles

| Role | Can do |
| ---- | ------ |
| `VIEWER` | Log in, view dashboard, watch telemetry, read the map |
| `COMMANDER` | Everything `VIEWER` can, plus move/reset the robot, read audit log, promote other users |

New self-registrations are always created as `VIEWER`. The server seeds one
`COMMANDER` on first boot from the `DEFAULT_COMMANDER_*` env vars (see
`.env.example` at the repo root) so the operator can always log in.

## Routes

All under `/v1/` and wrapped in `{ message, data, status_code }`.

| Method | Path                          | Notes                          |
| ------ | ----------------------------- | ------------------------------ |
| GET    | `/v1/health/`                 | health probe                   |
| POST   | `/v1/auth/login`              | sets `refresh_token` cookie    |
| POST   | `/v1/auth/register`           | sets `refresh_token` cookie    |
| POST   | `/v1/auth/refresh-token`      | reads `refresh_token` cookie   |
| POST   | `/v1/auth/logout`             | clears `refresh_token` cookie  |
| GET    | `/v1/auth/session`            | Bearer required                |
| GET    | `/v1/map/`                    | Bearer required, cached        |
| POST   | `/v1/robot/move/`             | Bearer + `COMMANDER`           |
| POST   | `/v1/robot/reset/`            | Bearer + `COMMANDER`           |
| WS     | `/v1/robot/`                  | telemetry stream               |
| GET    | `/v1/audit-log/`              | Bearer + `COMMANDER`           |
| GET    | `/v1/admin/users`             | Bearer + `COMMANDER`           |
| POST   | `/v1/admin/user/:id/role`     | Bearer + `COMMANDER`           |

## Local development

```bash
npm install
npm run dev
```

Required env (see `.env.example` at the repo root):

```
PORT=8000
JWT_SECRET_KEY=secret
MONGODB_URI=mongodb://localhost:27017/robocontrol
REDIS_URL=redis://localhost:6379/0
BASE_ROBOT_API_URL=http://localhost:5555
CORS_ORIGINS=*
DEFAULT_COMMANDER_EMAIL=commander@robocontrol.local
DEFAULT_COMMANDER_PASSWORD=commander123
```

## Production build

```bash
npm run build
npm start
```

# Client Request Desk

A production-style assignment implementation for local businesses to receive, qualify, and convert customer requests into work items.

## Quick start

Prerequisite: Node.js 20+.

```bash
npm run install:all
copy .env.example server\.env
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:5173`. The API runs on port 5000. Run `npm run build` and `npm test` from the root for validation.

## Features

- Mock login for Alice (Demo Business A) and Bob (Demo Business B)
- Request creation, editing, searching, and status filtering
- Workspace-specific dashboard, requests, activities, and work items
- Qualified-only work item conversion with human confirmation
- Activity timeline and useful loading, empty, error, and unauthorized states
- Prisma SQLite persistence with seed data

## Architecture

`client` is a Vite React TypeScript SPA. `server` is an Express TypeScript API. Prisma is the only database access layer and SQLite is used for local setup. The client stores only the selected demo user's identity and sends it as `x-user-id`.

### Workspace isolation

The server loads the user from `x-user-id` and attaches the database user to the request. Every request query includes both the resource ID and `workspaceId: req.user.workspaceId`; list, update, activity, conversion, summary, and work-item queries follow the same rule. Client-provided workspace IDs are never trusted. A cross-workspace ID therefore returns 404 without revealing the record.

### Conversion safety

`POST /api/requests/:id/convert` verifies ownership, status, and prior conversion. WorkItem.requestId is unique and creation plus its activity entry occur in one Prisma transaction. A duplicate request returns 409 and cannot create a second activity. The UI asks for confirmation before calling the endpoint and disables the confirm action while submitting.

## API

- `POST /api/auth/login` with `{ userId }`
- `GET /api/requests?status=NEW&search=website`
- `POST /api/requests`
- `GET /api/requests/:id`
- `PATCH /api/requests/:id`
- `GET /api/requests/:id/activity`
- `POST /api/requests/:id/convert`
- `GET /api/work-items`
- `GET /api/work-items/summary`

All protected endpoints require `x-user-id`.

## Database

`npm run db:migrate` creates the Prisma migration/database. `npm run db:seed` resets and inserts two clearly separated demo workspaces with four requests each. Prisma schema is at `server/prisma/schema.prisma`.

## Testing and production build

Backend tests use Vitest and Supertest for isolation and duplicate conversion behavior. `npm test` runs both packages. `npm run build` compiles the API and creates the Vite production bundle.

## Design decisions and trade-offs

Mock auth is intentional for the assignment and is not a replacement for sessions or OAuth. SQLite keeps setup approachable. The API uses simple route handlers rather than a large service framework so the ownership checks remain visible. In a production deployment, add real identity verification, CSRF protection for cookie sessions, rate limits, structured logging, and migration deployment automation.

## AI tools used

The project was generated and reviewed with GitHub Copilot in VS Code.

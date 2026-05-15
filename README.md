# KEYRA For The People (ftp.keyra.ie)

Verified consumer trust platform for bank-specific security modernization campaigns.

## Stack

- **Frontend:** Angular 19 (KEYRA black/white design system)
- **Backend:** Node.js + Express + Prisma
- **Database:** PostgreSQL

## Local setup

### 1. Database

Create database `keyra_ftp` on your PostgreSQL server, then configure:

```bash
cp api/.env.example api/.env
```

Default connection:

`postgresql://postgres:ciright@192.168.1.206:5432/keyra_ftp`

### 2. Install & migrate

```bash
npm run install:all
npm run db:push
npm run db:seed
```

### 3. Run

Terminal 1 — API:

```bash
npm run dev:api
```

Terminal 2 — Angular:

```bash
npm run dev:web
```

Open http://localhost:4200

## Demo accounts

| Role  | Email           | Password         |
|-------|-----------------|------------------|
| Admin | admin@keyra.ie  | KeyraAdmin2026!  |
| User  | demo@keyra.ie   | DemoUser2026!    |

After sign-in, use **Complete verification** (or `POST /api/auth/verify-demo`) to enable campaign participation.

## Routes

- `/` — Home
- `/{countryCode}` — Country banks (e.g. `/us`)
- `/{countryCode}/{bankSlug}` — Bank campaign (e.g. `/us/chase`)
- `/dashboard` — User dashboard
- `/admin/*` — Admin panel

## Railway deployment

1. Create a Railway project with **PostgreSQL** plugin.
2. Deploy from this repo (Dockerfile builds API + Angular).
3. Set environment variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string from Railway |
| `JWT_SECRET` | Long random secret |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | Your Railway URL (optional if same origin) |
| `INTERNAL_AUDIT_EMAIL` | Audit BCC address |

4. Railway runs migrations and serves the app on `$PORT`.

Health check: `/api/health`

## API overview

- `GET /api/countries` — List countries
- `GET /api/banks/:country/:slug` — Bank campaign page data
- `POST /api/campaign/join/:country/:slug` — Join (auth + verified)
- `POST /api/campaign/send-message/:country/:slug` — Send bank message
- `GET /api/admin/*` — Admin CRUD & logs

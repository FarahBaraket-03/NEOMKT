# GraphQL Tech Catalog API

Apollo Server 4 + TypeScript + Supabase GraphQL backend.

## Scripts

- `npm run dev` start in watch mode
- `npm run build` compile TypeScript
- `npm run start` run compiled output
- `npm run seed` seed Supabase tables with catalog data
- `npm run test` run all tests

## Environment

Create `.env` based on the project root specification:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `PORT`
- `NODE_ENV`

## Health check

`GET /health`

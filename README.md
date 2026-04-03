# GraphQL Tech Catalog 

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![GraphQL](https://img.shields.io/badge/GraphQL-API-E10098?logo=graphql&logoColor=white)
![Apollo Server](https://img.shields.io/badge/Apollo_Server-4-311C87?logo=apollographql&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=0A0A0A)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?logo=supabase&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-Testing-6E9F18?logo=vitest&logoColor=white)

A full-stack tech catalog platform built with GraphQL, Next.js, and Supabase.

The project includes:
- A GraphQL API with authentication, authorization, admin operations, and subscriptions.
- A Next.js frontend with public catalog browsing, admin dashboard/pages, API docs playground, and wishlist features.
- Supporting assets for database setup, specifications, design references, and scraping utilities.

## Overview
![homepage](image.png)
![product](image-2.png)
![brand](image-1.png)
## Project Structure

```text
.
|-- apps/
|   |-- api/                # Apollo GraphQL API (TypeScript)
|   |-- web/                # Next.js frontend (App Router)
|-- supabase/               # SQL migrations and CSV seed sources
|-- specs/                  # Product/design/task specifications
|-- documentation/          # Project documentation
|-- ExempleDesign/          # UI design/prototype playground
|-- webScraping/            # Data collection and mapping scripts (Python)
|-- package.json            # Root workspace scripts
`-- README.md
```

## Tech Stack

### Backend (apps/api)
- Node.js + TypeScript
- Apollo Server + Express
- GraphQL (queries, mutations, subscriptions)
- Supabase (auth + data)
- Vitest for testing

### Frontend (apps/web)
- Next.js (App Router)
- React 18
- Apollo Client
- Tailwind CSS
- Supabase client/auth helpers

## What The Project Is About

This project is a cyberpunk-themed technology catalog where users can browse products, brands, and categories, while admins can manage catalog data.

Core capabilities include:
- Product, brand, category, review, and spec management
- Admin-only operations for protected mutations
- Real-time subscription updates (for example, product updates)
- User wishlist flows
- API docs page to test GraphQL operations interactively

## Prerequisites

- Node.js 20+ (recommended)
- npm 10+
- A Supabase project (URL + keys)

## Getting Started

### 1. Install dependencies

From repository root:

```bash
npm install
```

### 2. Configure environment variables

Create local env files from examples:

- `apps/api/.env` from `apps/api/.env.example`
- `apps/web/.env.local` from `apps/web/.env.example`

Required API variables (`apps/api/.env`):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `PORT` (default `4000`)
- `NODE_ENV`
- `GRAPHQL_INTROSPECTION`

Required web variables (`apps/web/.env.local`):
- `NEXT_PUBLIC_GRAPHQL_HTTP_URL`
- `NEXT_PUBLIC_GRAPHQL_WS_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Run in development

From repository root (runs both API and web):

```bash
npm run dev
```

Or run each app separately:

```bash
npm run dev --workspace apps/api
npm run dev --workspace apps/web
```

## Common Scripts

From root:

```bash
npm run dev
npm run build
npm run test
```

API workspace (`apps/api`):

```bash
npm run dev --workspace apps/api
npm run build --workspace apps/api
npm run test --workspace apps/api
npm run seed --workspace apps/api
```

Web workspace (`apps/web`):

```bash
npm run dev --workspace apps/web
npm run build --workspace apps/web
npm run start --workspace apps/web
npm run codegen --workspace apps/web
```

## Endpoints

When running locally with defaults:
- GraphQL HTTP: `http://localhost:4000/graphql`
- GraphQL WS: `ws://localhost:4000/graphql`
- API health: `http://localhost:4000/health`
- Web app: `http://localhost:3000`

## Database And Data Assets

- SQL migrations: `supabase/migration/`
- Seed CSV files: `supabase/csv/`

## Troubleshooting

- If Next.js build/dev artifacts get corrupted (common on Windows + OneDrive), clean artifacts:

```bash
npm run clean:next --workspace apps/web
```

- If local API port is busy, change `PORT` in `apps/api/.env` and update web GraphQL URLs accordingly.

- If using a free-tier hosted API, first request may be slow after idle cold start.

## Notes

- This is an npm workspace monorepo (`apps/api`, `apps/web`).
- Keep environment variables private and do not commit real secrets.

## Security

- See [SECURITY.md](SECURITY.md) for the GraphQL API security model and controls.

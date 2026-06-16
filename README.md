# AgencyOS

> An all-in-one operating system for freelancers, agencies, consultants, and small service businesses — CRM, lead pipeline, projects, invoicing, scheduling, file sharing, a client portal, and AI-powered document generation, all in one multi-tenant dashboard.

AgencyOS replaces spreadsheets, manual invoicing, scattered chat threads, and a pile of single-purpose tools with one platform.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/) |
| Data fetching | React Query (TanStack Query) |
| Client state | Zustand |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth & orgs | [Clerk](https://clerk.com/) |
| Payments | [Stripe](https://stripe.com/) Billing |
| File storage | [UploadThing](https://uploadthing.com/) |
| AI | [Claude API](https://docs.anthropic.com/) |
| Charts | Recharts |
| Email | Resend |

## Core Features

- **Multi-tenant architecture** — strict per-organization data isolation
- **Role-based access** — Super Admin · Owner · Member · Client
- **CRM** — clients, notes, activity timeline
- **Lead pipeline** — Kanban board with drag-and-drop
- **Projects & tasks** — assignment, statuses, progress tracking
- **Invoicing** — line items, PDF export, payment tracking
- **Appointments** — booking page, availability, reminders
- **File sharing** — project folders, client access
- **Client portal** — project progress, invoices, downloads, messaging
- **AI generators** — proposals, contracts, follow-ups, meeting summaries
- **Subscription billing** — Free / Pro / Agency tiers with enforced limits
- **Analytics dashboard** — revenue, clients, conversion, completion

## Getting Started

> Full setup instructions are added as the corresponding features land. See [`docs/AgencyOS - Refined Blueprint.md`](docs/AgencyOS%20-%20Refined%20Blueprint.md) for the architecture and roadmap.

```bash
# install dependencies
npm install

# copy environment template and fill in values
cp .env.example .env

# run database migrations
npx prisma migrate dev

# start the dev server
npm run dev
```

## Project Documentation

- [`docs/AgencyOS - Refined Blueprint.md`](docs/AgencyOS%20-%20Refined%20Blueprint.md) — architecture, data model, and build order

## Development Workflow

This repository uses a feature-branch workflow with [Conventional Commits](https://www.conventionalcommits.org/):

- `main` is always deployable.
- Each change is made on a dedicated branch (`feat/…`, `fix/…`, `chore/…`, `docs/…`).
- Branches are merged into `main` via no-fast-forward merges (or PRs).

## License

[MIT](LICENSE)

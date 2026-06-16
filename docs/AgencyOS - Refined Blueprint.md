# AgencyOS — Refined SaaS Blueprint

> Supersedes `AgencyOS - SaaS Project Blueprint.pdf`. Same full scope (all 12 sections), with tech decisions made, schema gaps fixed, and multi-tenancy specified.

## Why this revision exists

The original PDF is a strong **vision doc** but a weak **build spec**: scope is broad, several core models have correctness gaps, and key tech choices are left as unresolved "OR" options. This document keeps the full scope and turns it into something buildable.

---

## 1. Resolved Tech Decisions (no more "OR")

| Area     | PDF said            | Decision                                                                                     | Why                                                                      |
| -------- | ------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Auth     | Clerk OR NextAuth   | **Clerk**                                                                                    | Built-in Organizations + invites + roles = multi-tenancy out of the box. |
| Storage  | UploadThing OR S3   | **UploadThing**                                                                              | Simplest path; signed uploads handled. S3 is premature.                  |
| AI       | Claude OR OpenAI    | **Claude API** (`claude-opus-4-8` for quality, `claude-haiku-4-5` for cheap/fast generators) | Best instruction-following for proposals/contracts; single provider.     |
| DB       | PostgreSQL + Prisma | **Keep** (host: Neon or Supabase Postgres)                                                   | Unchanged.                                                               |
| Payments | Stripe              | **Keep** — Stripe **Billing** (Products/Prices + Customer Portal + webhooks)                 | Don't hand-roll subscription state.                                      |

**Confirmed stack:** Next.js 15 (App Router) · TypeScript · Tailwind · shadcn/ui · React Query · Zustand · Prisma/Postgres · Clerk · Stripe · UploadThing · Claude API · Recharts.

---

## 2. Multi-Tenancy — the make-or-break

"No company can access another company's data" is the #1 requirement and the hardest correctness property.

- **Tenant key:** every tenant-owned row carries `organizationId`. Clerk Organization id is the source of truth.
- **Single choke point:** a Prisma Client Extension (or `withOrg(orgId)` wrapper) that auto-injects `organizationId` into every `where` and `create`. No hand-written per-query filters.
- **Server-side resolution:** `organizationId` always comes from the Clerk session (`auth().orgId`), **never** from client input.
- **Defense in depth:** Postgres Row-Level Security as a backstop for sensitive tables (Invoice, Client, Message, File).
- **Test it:** seed Org A + Org B; assert Org A's session can never read/write Org B rows.

---

## 3. Database Models (gaps fixed)

Every original entity kept. New/changed marked **(NEW)** / **(FIX)**.

### Identity & tenancy

- **Organization**: `id, name, slug, logo, plan, stripeCustomerId (NEW), createdAt`
- **User**: `id, clerkUserId (NEW), name, email, avatar, createdAt` — role/org moved to Membership **(FIX)**
- **Membership (NEW)**: `id, userId, organizationId, role` — user can belong to multiple orgs; role is per-org. Roles: `SUPER_ADMIN, OWNER, MEMBER, CLIENT`. Fixes the original single-FK `User.organizationId`.

### Billing (was entirely missing — NEW)

- **Subscription (NEW)**: `id, organizationId, stripeSubscriptionId, plan (FREE|PRO|AGENCY), status, currentPeriodEnd`
- **Plan limits enforced in code:** FREE = 5 clients / 2 projects / no AI; PRO = unlimited + AI; AGENCY = + team + client portal + advanced analytics. `assertWithinPlanLimit()` checked on create.

### CRM & sales

- **Client**: `id, organizationId, name, email, phone, company, notes, status, createdAt`
- **Lead**: `id, organizationId, title, source, value, stage, createdAt` — stages: New, Contacted, Proposal Sent, Negotiation, Won, Lost
- **Activity (NEW)**: `id, organizationId, clientId, userId, type, description, createdAt` — powers the CRM activity timeline.

### Delivery

- **Project**: `id, organizationId, clientId, title, description, status, progress, deadline, budget` — status: Planning, Active, Review, Completed
- **ProjectMember (NEW)**: `id, projectId, userId, role` — implements "assign team members"
- **Task**: `id, projectId, assignedTo, title, status, dueDate`
- **Invoice**: `id, organizationId, clientId, amount, currency (NEW), status, dueDate, issuedAt (NEW)` — status: Draft, Sent, Paid, Overdue
- **InvoiceItem (NEW)**: `id, invoiceId, description, quantity, unitPrice` — line items for real PDFs
- **Appointment**: `id, organizationId, clientId, startTime, endTime, notes`

### Comms & files

- **Conversation (NEW)** + **Message (FIX)**: `id, organizationId (FIX), conversationId (FIX), senderId, content, createdAt`. Original sender/receiver-only model broke tenant isolation.
- **File**: `id, organizationId, projectId, uploadedBy, fileUrl, fileName, sizeBytes (NEW), createdAt (NEW)`
- **Notification (NEW)**: `id, organizationId, userId, type, payload, readAt`

---

## 4. Features (kept in full)

Dashboard (KPIs + Recharts) · CRM · Lead Pipeline (Kanban drag-drop) · Project Management · Invoicing (PDF + tracking) · Appointment System (booking + reminders) · File Sharing · Client Portal · AI Features · Subscription Plans · Landing Page.

- **AI Features** (Proposal, Contract, Follow-Up, Meeting Summary): single `/api/ai/generate` route, structured prompts per type, streamed responses, output saved as an editable record. Gated behind PRO+.
- **Invoicing → PDF:** `@react-pdf/renderer` using InvoiceItem lines.
- **Reminders / Notifications:** email via Resend; reminders via Vercel Cron.
- **Client Portal:** same app, `CLIENT` membership, strictly org- and project-scoped views.

---

## 5. Suggested build order (sequencing, not cutting)

1. Scaffold + Prisma schema + Clerk auth + **multi-tenancy choke point & isolation test**
2. Org / membership / roles + authorization guards
3. CRM (Client + Activity) → Lead Pipeline (Kanban)
4. Projects + Tasks + ProjectMembers
5. Invoicing (+ InvoiceItem, PDF)
6. Stripe Billing + Subscription + plan-limit enforcement
7. Appointments + Notifications + email reminders
8. File Sharing (UploadThing) + Client Portal + Conversation/Message chat
9. AI generators
10. Dashboard analytics + Landing page polish

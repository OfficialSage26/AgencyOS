/**
 * Example/demo data seeder for AgencyOS.
 *
 * Idempotent: every row uses a stable `seed_*` id and upserts, so you can run it
 * repeatedly without creating duplicates. It targets the first organization in
 * the database and that org's first member (used for task assignment, activity
 * authorship, and project membership).
 *
 *   node scripts/seed-example.cjs
 *
 * Bypasses plan limits (it writes directly via SQL) and sets the org to AGENCY
 * so every feature is demonstrable.
 */
require("dotenv").config();
const { Pool } = require("pg");

const connectionString = (process.env.DATABASE_URL || "")
  .replace(/[?&]sslmode=[^&]*/, "")
  .replace(/^"|"$/g, "");
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

const now = new Date();
const day = 24 * 60 * 60 * 1000;
const d = (offsetDays) => new Date(now.getTime() + offsetDays * day);
const monthsAgo = (n) => new Date(now.getFullYear(), now.getMonth() - n, 10, 10, 0, 0);
const at = (offsetDays, h, m) => {
  const x = d(offsetDays);
  x.setHours(h, m, 0, 0);
  return x;
};

async function upsert(client, table, row) {
  const cols = Object.keys(row);
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
  const updates = cols
    .filter((c) => c !== "id")
    .map((c) => `"${c}" = EXCLUDED."${c}"`)
    .join(", ");
  const sql =
    `INSERT INTO "${table}" (${cols.map((c) => `"${c}"`).join(", ")}) ` +
    `VALUES (${placeholders}) ON CONFLICT ("id") DO UPDATE SET ${updates}`;
  await client.query(sql, Object.values(row));
}

async function main() {
  const org = (
    await pool.query(`SELECT id FROM "Organization" ORDER BY "createdAt" ASC LIMIT 1`)
  ).rows[0];
  if (!org) throw new Error("No organization found. Create one in the app first.");
  const orgId = org.id;

  const member = (
    await pool.query(`SELECT "userId" FROM "Membership" WHERE "organizationId" = $1 LIMIT 1`, [orgId])
  ).rows[0];
  const userId = member ? member.userId : null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // --- Clients ---------------------------------------------------------
    const clients = [
      ["northwind", "Northwind Studio", "hello@northwind.studio", "+63 917 555 0101", "Northwind Studio", "ACTIVE", "Design-led brand studio. Retainer client.", "seed_portal_northwind_demo_link_001"],
      ["brightwave", "Brightwave Media", "team@brightwave.media", "+63 917 555 0102", "Brightwave Media", "ACTIVE", "Content & paid social.", null],
      ["acme", "Acme Robotics", "ops@acmerobotics.com", "+63 917 555 0103", "Acme Robotics", "ACTIVE", "Hardware launch in Q3.", null],
      ["lumen", "Lumen Health", "pm@lumenhealth.io", "+63 917 555 0104", "Lumen Health", "INACTIVE", "Patient portal engagement.", null],
      ["cedar", "Cedar & Co", "studio@cedar.co", "+63 917 555 0105", "Cedar & Co", "ACTIVE", "Annual report, repeat client.", null],
      ["pixel", "Pixel Forge", "accounts@pixelforge.gg", "+63 917 555 0106", "Pixel Forge", "ARCHIVED", "Past project, archived.", null],
    ];
    for (const [key, name, email, phone, company, status, notes, portalToken] of clients) {
      await upsert(client, "Client", {
        id: `seed_client_${key}`,
        organizationId: orgId,
        name,
        email,
        phone,
        company,
        notes,
        status,
        portalToken,
        createdAt: now,
        updatedAt: now,
      });
    }

    // --- Leads -----------------------------------------------------------
    const leads = [
      ["bakery", "Coastal Bakery rebrand", "Referral", 4500, "NEW", 0],
      ["fintech", "FinTech app MVP", "Inbound", 22000, "CONTACTED", 0],
      ["nonprofit", "Nonprofit website", "Webform", 8000, "PROPOSAL_SENT", 0],
      ["saas", "SaaS dashboard redesign", "Outbound", 35000, "NEGOTIATION", 0],
      ["realty", "Realty landing pages", "Referral", 6000, "WON", 0],
      ["crypto", "Crypto whitepaper", "Cold email", 3000, "LOST", 0],
    ];
    for (const [key, title, source, value, stage, position] of leads) {
      await upsert(client, "Lead", {
        id: `seed_lead_${key}`,
        organizationId: orgId,
        title,
        source,
        value,
        stage,
        position,
        createdAt: now,
        updatedAt: now,
      });
    }

    // --- Projects --------------------------------------------------------
    const projects = [
      ["brand", "northwind", "Brand identity system", "Logo suite, type system, and guidelines.", "ACTIVE", 65, d(20), 12000],
      ["site", "brightwave", "Marketing site revamp", "New marketing site on the latest stack.", "REVIEW", 80, d(10), 18000],
      ["launch", "acme", "Product launch campaign", "Go-to-market for the Q3 hardware launch.", "PLANNING", 15, d(45), 25000],
      ["portal", "lumen", "Patient portal UX", "Research, flows, and a design system.", "ACTIVE", 40, d(30), 30000],
      ["report", "cedar", "Annual report design", "Editorial layout and data viz.", "COMPLETED", 100, d(-5), 9000],
    ];
    for (const [key, clientKey, title, description, status, progress, deadline, budget] of projects) {
      await upsert(client, "Project", {
        id: `seed_project_${key}`,
        organizationId: orgId,
        clientId: `seed_client_${clientKey}`,
        title,
        description,
        status,
        progress,
        deadline,
        budget,
        createdAt: now,
        updatedAt: now,
      });
    }

    // --- Tasks -----------------------------------------------------------
    const tasks = [
      ["brand-1", "brand", "Moodboard & direction", "DONE", d(-10), true],
      ["brand-2", "brand", "Logo concepts", "IN_PROGRESS", d(4), true],
      ["brand-3", "brand", "Type & color system", "TODO", d(12), false],
      ["site-1", "site", "Wireframes", "DONE", d(-8), true],
      ["site-2", "site", "Build homepage", "REVIEW", d(2), true],
      ["site-3", "site", "QA & launch", "TODO", d(9), false],
      ["launch-1", "launch", "Campaign brief", "IN_PROGRESS", d(6), true],
      ["launch-2", "launch", "Channel plan", "TODO", d(15), false],
      ["portal-1", "portal", "User interviews", "DONE", d(-3), true],
      ["portal-2", "portal", "Flow diagrams", "IN_PROGRESS", d(7), true],
    ];
    let pos = 0;
    for (const [key, projectKey, title, status, dueDate, assign] of tasks) {
      await upsert(client, "Task", {
        id: `seed_task_${key}`,
        projectId: `seed_project_${projectKey}`,
        assignedTo: assign ? userId : null,
        title,
        status,
        dueDate,
        position: pos++,
        createdAt: now,
        updatedAt: now,
      });
    }

    // --- Project members -------------------------------------------------
    if (userId) {
      for (const key of ["brand", "site", "portal"]) {
        await upsert(client, "ProjectMember", {
          id: `seed_pm_${key}`,
          projectId: `seed_project_${key}`,
          userId,
          createdAt: now,
        });
      }
    }

    // --- Invoices + line items ------------------------------------------
    const invoices = [
      ["1", "northwind", "INV-0001", "PAID", monthsAgo(4), [["Brand discovery workshop", 1, 2500], ["Logo design", 1, 3500]]],
      ["2", "brightwave", "INV-0002", "PAID", monthsAgo(3), [["Content strategy", 1, 2000], ["Monthly retainer", 1, 4000]]],
      ["3", "acme", "INV-0003", "PAID", monthsAgo(2), [["Campaign planning", 1, 5000], ["Creative concepts", 2, 1500]]],
      ["4", "cedar", "INV-0004", "PAID", monthsAgo(1), [["Annual report layout", 1, 6000]]],
      ["5", "lumen", "INV-0005", "SENT", d(-3), [["UX research", 1, 4500], ["Design system", 1, 5500]]],
      ["6", "pixel", "INV-0006", "OVERDUE", d(-40), [["Landing page", 1, 1800], ["Revisions", 3, 400]]],
      ["7", "northwind", "INV-0007", "DRAFT", null, [["Guidelines document", 1, 2200]]],
    ];
    for (const [key, clientKey, number, status, issuedAt, items] of invoices) {
      const amount = items.reduce((s, [, q, p]) => s + q * p, 0);
      const dueDate = issuedAt ? new Date(issuedAt.getTime() + 14 * day) : null;
      await upsert(client, "Invoice", {
        id: `seed_invoice_${key}`,
        organizationId: orgId,
        clientId: `seed_client_${clientKey}`,
        number,
        amount,
        currency: "PHP",
        status,
        issuedAt,
        dueDate,
        createdAt: issuedAt || now,
        updatedAt: now,
      });
      let i = 0;
      for (const [description, quantity, unitPrice] of items) {
        await upsert(client, "InvoiceItem", {
          id: `seed_item_${key}_${i++}`,
          invoiceId: `seed_invoice_${key}`,
          description,
          quantity,
          unitPrice,
        });
      }
    }

    // --- Appointments ----------------------------------------------------
    const appts = [
      ["kickoff", "northwind", "Kickoff call", at(2, 10, 0), at(2, 10, 30), "Align on brand direction."],
      ["review", "brightwave", "Design review", at(5, 14, 0), at(5, 15, 0), "Walk through homepage build."],
      ["discovery", "acme", "Discovery workshop", at(9, 9, 30), at(9, 11, 0), "Launch goals and channels."],
      ["retro", "cedar", "Project retro", at(-7, 15, 0), at(-7, 16, 0), "Wrap-up and lessons learned."],
    ];
    for (const [key, clientKey, title, startTime, endTime, notes] of appts) {
      await upsert(client, "Appointment", {
        id: `seed_appt_${key}`,
        organizationId: orgId,
        clientId: `seed_client_${clientKey}`,
        title,
        startTime,
        endTime,
        notes,
        createdAt: now,
        updatedAt: now,
      });
    }

    // --- Activity (CRM timeline) ----------------------------------------
    const activities = [
      ["n1", "northwind", "NOTE", "Signed retainer for Q3."],
      ["n2", "northwind", "CALL", "Discussed logo concepts on a call."],
      ["b1", "brightwave", "EMAIL", "Sent homepage staging link for review."],
      ["a1", "acme", "MEETING", "Initial discovery meeting completed."],
      ["l1", "lumen", "NOTE", "Awaiting stakeholder feedback on flows."],
      ["c1", "cedar", "STATUS_CHANGE", "Project marked completed."],
    ];
    for (const [key, clientKey, type, description] of activities) {
      await upsert(client, "Activity", {
        id: `seed_activity_${key}`,
        organizationId: orgId,
        clientId: `seed_client_${clientKey}`,
        userId,
        type,
        description,
        createdAt: now,
      });
    }

    // --- Bump plan so limits don't block the demo ------------------------
    await client.query(`UPDATE "Organization" SET plan = 'AGENCY' WHERE id = $1`, [orgId]);

    await client.query("COMMIT");
    console.log(
      `Seeded org ${orgId}: ${clients.length} clients, ${leads.length} leads, ` +
        `${projects.length} projects, ${tasks.length} tasks, ${invoices.length} invoices, ` +
        `${appts.length} appointments, ${activities.length} activities. Plan → AGENCY.`,
    );
    console.log(`Client portal demo: /portal/seed_portal_northwind_demo_link_001`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

main()
  .then(() => pool.end())
  .catch((err) => {
    console.error("Seed failed:", err.message);
    pool.end().finally(() => process.exit(1));
  });

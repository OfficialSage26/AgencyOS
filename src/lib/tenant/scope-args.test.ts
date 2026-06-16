import { describe, expect, it } from "vitest";
import { scopeArgs, TENANT_MODELS } from "@/lib/tenant/scope-args";

const ORG = "org_aaa";

describe("scopeArgs — tenant isolation choke point", () => {
  it("injects organizationId into where for list/read operations", () => {
    const result = scopeArgs("Client", "findMany", { where: { status: "ACTIVE" } }, ORG);
    expect(result.where).toEqual({ status: "ACTIVE", organizationId: ORG });
  });

  it("injects organizationId into an empty findMany", () => {
    const result = scopeArgs("Project", "findMany", undefined, ORG);
    expect(result.where).toEqual({ organizationId: ORG });
  });

  it("scopes count, aggregate, updateMany and deleteMany", () => {
    for (const op of ["count", "aggregate", "updateMany", "deleteMany"]) {
      const result = scopeArgs("Invoice", op, { where: { id: "x" } }, ORG);
      expect(result.where).toMatchObject({ organizationId: ORG });
    }
  });

  it("forces organizationId on create (cannot be overridden by caller input)", () => {
    const result = scopeArgs(
      "Client",
      "create",
      { data: { name: "Acme", organizationId: "EVIL" } },
      ORG,
    );
    expect((result.data as Record<string, unknown>).organizationId).toBe(ORG);
  });

  it("forces organizationId on every row of createMany", () => {
    const result = scopeArgs("Lead", "createMany", { data: [{ title: "A" }, { title: "B" }] }, ORG);
    expect(result.data).toEqual([
      { title: "A", organizationId: ORG },
      { title: "B", organizationId: ORG },
    ]);
  });

  it("rejects unscopable single-row operations to prevent cross-tenant leaks", () => {
    for (const op of ["findUnique", "update", "delete", "upsert"]) {
      expect(() => scopeArgs("Client", op, { where: { id: "x" } }, ORG)).toThrow(/not allowed/);
    }
  });

  it("does not touch models without organizationId (e.g. Task, InvoiceItem, User)", () => {
    for (const model of ["Task", "InvoiceItem", "User", "ProjectMember"]) {
      expect(TENANT_MODELS.has(model)).toBe(false);
      const args = { where: { id: "x" } };
      const result = scopeArgs(model, "findMany", args, ORG);
      expect(result.where).toEqual({ id: "x" });
    }
  });

  it("isolates two organizations: scoped args never share an organizationId", () => {
    const a = scopeArgs("Client", "findMany", {}, "org_a");
    const b = scopeArgs("Client", "findMany", {}, "org_b");
    expect(a.where).toEqual({ organizationId: "org_a" });
    expect(b.where).toEqual({ organizationId: "org_b" });
    expect(a.where).not.toEqual(b.where);
  });
});

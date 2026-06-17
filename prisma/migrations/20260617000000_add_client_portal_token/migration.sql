-- Add capability token for the read-only client portal.
ALTER TABLE "Client" ADD COLUMN "portalToken" TEXT;

-- Ensure tokens are unique so a token resolves to exactly one client.
CREATE UNIQUE INDEX "Client_portalToken_key" ON "Client"("portalToken");

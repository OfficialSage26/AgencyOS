-- Philippines-based default currency for new invoices.
ALTER TABLE "Invoice" ALTER COLUMN "currency" SET DEFAULT 'PHP';

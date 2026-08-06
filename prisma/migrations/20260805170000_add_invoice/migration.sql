-- Create Invoice table
CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" varchar(36) PRIMARY KEY,
    "subscriptionId" varchar(36) NOT NULL,
    "provider" varchar(50) NOT NULL,
    "providerInvoiceId" varchar(255),
    "amountPaid" integer NOT NULL,
    "currency" varchar(10) NOT NULL,
    "status" varchar(50) NOT NULL,
    "rawPayload" jsonb NOT NULL,
    "createdAt" timestamp(6) DEFAULT now()
);

ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription" ("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "idx_invoice_subscription" ON "Invoice" ("subscriptionId");
CREATE INDEX IF NOT EXISTS "idx_invoice_provider_invoice" ON "Invoice" ("providerInvoiceId");

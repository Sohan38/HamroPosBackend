-- Create ProcessedEvent table for webhook replay protection
CREATE TABLE IF NOT EXISTS "ProcessedEvent" (
    "id" bigserial PRIMARY KEY,
    "provider" varchar(50) NOT NULL,
    "providerEventId" varchar(255) NOT NULL,
    "eventType" varchar(100) NOT NULL,
    "createdAt" timestamp(6) DEFAULT now()
);

ALTER TABLE "ProcessedEvent" ADD CONSTRAINT "ProcessedEvent_provider_event_unique" UNIQUE ("provider", "providerEventId");

CREATE INDEX IF NOT EXISTS "idx_processed_event_provider" ON "ProcessedEvent" ("provider");
CREATE INDEX IF NOT EXISTS "idx_processed_event_provider_event" ON "ProcessedEvent" ("provider", "providerEventId");

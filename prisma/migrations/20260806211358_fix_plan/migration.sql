/*
  Warnings:

  - Made the column `createdAt` on table `Invoice` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `ProcessedEvent` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_subscriptionId_fkey";

-- DropIndex
DROP INDEX "idx_invoice_provider_invoice";

-- DropIndex
DROP INDEX "idx_invoice_subscription";

-- DropIndex
DROP INDEX "idx_processed_event_provider";

-- DropIndex
DROP INDEX "idx_processed_event_provider_event";

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "createdAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "description" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ProcessedEvent" ALTER COLUMN "createdAt" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "ProcessedEvent_provider_event_unique" RENAME TO "ProcessedEvent_provider_providerEventId_key";

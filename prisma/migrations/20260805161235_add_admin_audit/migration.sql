-- CreateTable
CREATE TABLE "Organization" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "maxDevices" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "valueType" VARCHAR(20) NOT NULL DEFAULT 'boolean',
    "description" TEXT,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanEntitlement" (
    "planId" VARCHAR(50) NOT NULL,
    "featureId" VARCHAR(100) NOT NULL,
    "booleanValue" BOOLEAN NOT NULL DEFAULT true,
    "numericValue" INTEGER,

    CONSTRAINT "PlanEntitlement_pkey" PRIMARY KEY ("planId","featureId")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" VARCHAR(36) NOT NULL,
    "organizationId" VARCHAR(36) NOT NULL,
    "planId" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'trial',
    "billingCycle" VARCHAR(20) NOT NULL DEFAULT 'yearly',
    "isLifetime" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 7,
    "cancelledAt" TIMESTAMP(3),
    "paymentProviderRef" VARCHAR(255),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "License" (
    "id" VARCHAR(36) NOT NULL,
    "subscriptionId" VARCHAR(36) NOT NULL,
    "activationKeyLookup" VARCHAR(64) NOT NULL,
    "activationKeyVerify" VARCHAR(255) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "maxDevicesOverride" INTEGER,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseEntitlementOverride" (
    "licenseId" VARCHAR(36) NOT NULL,
    "featureId" VARCHAR(100) NOT NULL,
    "booleanValue" BOOLEAN,
    "numericValue" INTEGER,

    CONSTRAINT "LicenseEntitlementOverride_pkey" PRIMARY KEY ("licenseId","featureId")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" VARCHAR(36) NOT NULL,
    "licenseId" VARCHAR(36) NOT NULL,
    "platform" VARCHAR(30) NOT NULL,
    "manufacturer" VARCHAR(100),
    "model" VARCHAR(100),
    "appVersion" VARCHAR(30) NOT NULL,
    "lastSeenAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivationLog" (
    "id" BIGSERIAL NOT NULL,
    "licenseId" VARCHAR(36),
    "deviceId" VARCHAR(36),
    "ipAddress" VARCHAR(45) NOT NULL,
    "userAgent" TEXT,
    "action" VARCHAR(50) NOT NULL,
    "isSuccess" BOOLEAN NOT NULL,
    "failureReason" VARCHAR(255),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" VARCHAR(36) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAudit" (
    "id" BIGSERIAL NOT NULL,
    "adminId" VARCHAR(36) NOT NULL,
    "targetAdminId" VARCHAR(36),
    "action" VARCHAR(100) NOT NULL,
    "details" VARCHAR(1024),
    "isSuccess" BOOLEAN NOT NULL DEFAULT true,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrismaMigrations" (
    "id" SERIAL NOT NULL,
    "checksum" TEXT NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "migrationName" TEXT NOT NULL,
    "logs" TEXT,
    "rolledBackAt" TIMESTAMP(3),
    "appliedStepsCount" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3),
    "stepCount" INTEGER NOT NULL,

    CONSTRAINT "PrismaMigrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "License_activationKeyLookup_key" ON "License"("activationKeyLookup");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- AddForeignKey
ALTER TABLE "PlanEntitlement" ADD CONSTRAINT "PlanEntitlement_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanEntitlement" ADD CONSTRAINT "PlanEntitlement_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseEntitlementOverride" ADD CONSTRAINT "LicenseEntitlementOverride_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseEntitlementOverride" ADD CONSTRAINT "LicenseEntitlementOverride_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivationLog" ADD CONSTRAINT "ActivationLog_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivationLog" ADD CONSTRAINT "ActivationLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

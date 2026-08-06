export type LicenseStatus = 'active' | 'suspended';
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'unpaid';
export type BillingCycle = 'monthly' | 'yearly' | 'lifetime';
export type FeatureValueType = 'boolean' | 'numeric';

export type EntitlementValue = boolean | number;
export type EntitlementMap = Record<string, EntitlementValue>;

export interface FeatureEntitlement {
    featureId: string;
    valueType: FeatureValueType;
    booleanValue?: boolean | null;
    numericValue?: number | null;
}

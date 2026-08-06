import { SubscriptionService } from './subscription.service';
import { logger } from '../config/logger';
import { InvoiceRepository } from '../repositories/invoice.repository';
import { ProcessedEventRepository } from '../repositories/processedEvent.repository';

const makeId = () => `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export class BillingService {
    private subscriptionService = new SubscriptionService();
    private invoiceRepo = new InvoiceRepository();
    private processedRepo = new ProcessedEventRepository();

    async handleEvent(event: any) {
        // Basic router for billing provider events. Keep minimal and idempotent.
        const type = event.type || event.event;
        logger.info('Billing webhook received', type);

        try {
            // replay protection: check provider event id
            const providerEventId = event.id || event.eventId || event.data?.object?.id || event.data?.id;
            const providerName = event.provider || 'unknown';
            if (providerEventId) {
                const seen = await this.processedRepo.findByProviderEventId(providerName, providerEventId);
                if (seen) {
                    logger.info('Duplicate billing event detected, skipping', providerEventId);
                    return;
                }
            }

            switch (type) {
                case 'invoice.paid': {
                    const invoiceObj = event.data?.object ?? event.data;
                    // persist invoice idempotently
                    const provider = invoiceObj.provider || 'unknown';
                    const providerInvoiceId = invoiceObj.id || invoiceObj.invoiceId || invoiceObj.providerInvoiceId;
                    if (providerInvoiceId) {
                        const existing = await this.invoiceRepo.findByProviderInvoiceId(provider, providerInvoiceId);
                        if (!existing) {
                            await this.invoiceRepo.create({
                                id: makeId(),
                                subscriptionId: invoiceObj.subscriptionId || invoiceObj.subscription?.id,
                                provider,
                                providerInvoiceId,
                                amountPaid: Math.round((invoiceObj.amount_paid ?? invoiceObj.amountPaid ?? 0) * 100),
                                currency: invoiceObj.currency ?? 'usd',
                                status: 'paid',
                                rawPayload: invoiceObj,
                            });
                        }
                    }

                    await this.subscriptionService.handleInvoicePaid(invoiceObj);
                    if (providerEventId) {
                        await this.processedRepo.create({ provider: providerName, providerEventId, eventType: type });
                    }
                    break;
                }
                case 'invoice.payment_failed': {
                    const invoiceObj = event.data?.object ?? event.data;
                    const provider = invoiceObj.provider || 'unknown';
                    const providerInvoiceId = invoiceObj.id || invoiceObj.invoiceId || invoiceObj.providerInvoiceId;
                    if (providerInvoiceId) {
                        const existing = await this.invoiceRepo.findByProviderInvoiceId(provider, providerInvoiceId);
                        if (!existing) {
                            await this.invoiceRepo.create({
                                id: makeId(),
                                subscriptionId: invoiceObj.subscriptionId || invoiceObj.subscription?.id,
                                provider,
                                providerInvoiceId,
                                amountPaid: Math.round((invoiceObj.amount_due ?? invoiceObj.amountDue ?? 0) * 100),
                                currency: invoiceObj.currency ?? 'usd',
                                status: 'failed',
                                rawPayload: invoiceObj,
                            });
                        }
                    }

                    await this.subscriptionService.handlePaymentFailed(invoiceObj);
                    if (providerEventId) {
                        await this.processedRepo.create({ provider: providerName, providerEventId, eventType: type });
                    }
                    break;
                }
                default:
                    logger.warn('Unhandled billing event type', type);
            }
        } catch (err) {
            logger.error('Error handling billing event', err);
            throw err;
        }
    }
}

/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1TimelineEventContentPayload } from './Cas1TimelineEventContentPayload';
import type { Cas1TimelineEventPayloadBookingSummary } from './Cas1TimelineEventPayloadBookingSummary';
export type Cas1BookingCancelledContentPayload = (Cas1TimelineEventContentPayload & {
    appealChangeRequestId?: string;
    booking?: Cas1TimelineEventPayloadBookingSummary;
    cancellationReason?: string;
} & {
    booking: Cas1TimelineEventPayloadBookingSummary;
    cancellationReason: string;
});


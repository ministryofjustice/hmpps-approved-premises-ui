/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1TimelineEventContentPayload } from './Cas1TimelineEventContentPayload';
import type { Cas1TimelineEventPayloadBookingSummary } from './Cas1TimelineEventPayloadBookingSummary';
export type Cas1PlannedTransferRequestAcceptedPayload = (Cas1TimelineEventContentPayload & {
    from: Cas1TimelineEventPayloadBookingSummary;
    to: Cas1TimelineEventPayloadBookingSummary;
});


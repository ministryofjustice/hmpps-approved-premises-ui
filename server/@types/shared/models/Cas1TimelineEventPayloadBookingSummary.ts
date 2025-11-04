/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NamedId } from './NamedId';
import type { TransferReason } from './TransferReason';
export type Cas1TimelineEventPayloadBookingSummary = {
    additionalInformation?: string;
    arrivalDate: string;
    bookingId: string;
    departureDate: string;
    premises: NamedId;
    transferReason?: TransferReason;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1TimelineEventPayloadBookingSummary } from './Cas1TimelineEventPayloadBookingSummary';
import type { Cas1TimelineEventTransferType } from './Cas1TimelineEventTransferType';
export type Cas1TimelineEventTransferInfo = {
    booking: Cas1TimelineEventPayloadBookingSummary;
    changeRequestId?: string;
    type: Cas1TimelineEventTransferType;
};


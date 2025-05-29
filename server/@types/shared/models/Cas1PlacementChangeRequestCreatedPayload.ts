/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ChangeRequestType } from './Cas1ChangeRequestType';
import type { Cas1TimelineEventContentPayload } from './Cas1TimelineEventContentPayload';
import type { Cas1TimelineEventPayloadBookingSummary } from './Cas1TimelineEventPayloadBookingSummary';
import type { NamedId } from './NamedId';
export type Cas1PlacementChangeRequestCreatedPayload = (Cas1TimelineEventContentPayload & {
    changeRequestId: string;
    booking: Cas1TimelineEventPayloadBookingSummary;
    reason: NamedId;
    changeRequestType: Cas1ChangeRequestType;
});


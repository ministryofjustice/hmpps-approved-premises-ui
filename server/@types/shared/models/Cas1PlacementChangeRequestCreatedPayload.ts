/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ChangeRequestType } from './Cas1ChangeRequestType';
import type { Cas1TimelineEventContentPayload } from './Cas1TimelineEventContentPayload';
import type { Cas1TimelineEventPayloadBookingSummary } from './Cas1TimelineEventPayloadBookingSummary';
import type { NamedId } from './NamedId';
export type Cas1PlacementChangeRequestCreatedPayload = (Cas1TimelineEventContentPayload & {
    booking?: Cas1TimelineEventPayloadBookingSummary;
    changeRequestId?: string;
    changeRequestType?: Cas1ChangeRequestType;
    reason?: NamedId;
} & {
    booking: Cas1TimelineEventPayloadBookingSummary;
    changeRequestId: string;
    changeRequestType: Cas1ChangeRequestType;
    reason: NamedId;
});


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1TimelineEventContentPayload } from './Cas1TimelineEventContentPayload';
import type { NamedId } from './NamedId';
export type Cas1PlacementAppealAcceptedPayload = (Cas1TimelineEventContentPayload & {
    premises: NamedId;
    expectedArrival: string;
    expectedDeparture: string;
});


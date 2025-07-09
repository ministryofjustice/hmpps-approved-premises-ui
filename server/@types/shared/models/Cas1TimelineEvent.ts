/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesUser } from './ApprovedPremisesUser';
import type { Cas1BookingCancelledContentPayload } from './Cas1BookingCancelledContentPayload';
import type { Cas1BookingChangedContentPayload } from './Cas1BookingChangedContentPayload';
import type { Cas1BookingMadeContentPayload } from './Cas1BookingMadeContentPayload';
import type { Cas1PlacementChangeRequestCreatedPayload } from './Cas1PlacementChangeRequestCreatedPayload';
import type { Cas1PlacementChangeRequestRejectedPayload } from './Cas1PlacementChangeRequestRejectedPayload';
import type { Cas1TimelineEventAssociatedUrl } from './Cas1TimelineEventAssociatedUrl';
import type { Cas1TimelineEventType } from './Cas1TimelineEventType';
import type { Cas1TriggerSourceType } from './Cas1TriggerSourceType';
import type { TemporaryAccommodationUser } from './TemporaryAccommodationUser';
import type { UserSummary } from './UserSummary';
export type Cas1TimelineEvent = {
    associatedUrls?: Array<Cas1TimelineEventAssociatedUrl>;
    /**
     * Timeline description. If a value is provided for 'payload', that should be instead be used to build a description
     */
    content?: string;
    createdBy?: (ApprovedPremisesUser | TemporaryAccommodationUser);
    createdBySummary?: UserSummary;
    id: string;
    occurredAt: string;
    payload?: (Cas1BookingCancelledContentPayload | Cas1BookingChangedContentPayload | Cas1BookingMadeContentPayload | Cas1PlacementChangeRequestCreatedPayload | Cas1PlacementChangeRequestRejectedPayload);
    schemaVersion?: number;
    triggerSource?: Cas1TriggerSourceType;
    type: Cas1TimelineEventType;
};


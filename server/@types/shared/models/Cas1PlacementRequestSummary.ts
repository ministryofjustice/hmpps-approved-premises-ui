/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FullPersonSummary } from './FullPersonSummary';
import type { PlacementRequestStatus } from './PlacementRequestStatus';
import type { RestrictedPersonSummary } from './RestrictedPersonSummary';
import type { UnknownPersonSummary } from './UnknownPersonSummary';
export type Cas1PlacementRequestSummary = {
    applicationId?: string;
    applicationSubmittedDate?: string;
    firstBookingArrivalDate?: string;
    firstBookingPremisesName?: string;
    id: string;
    isParole: boolean;
    person: (FullPersonSummary | RestrictedPersonSummary | UnknownPersonSummary);
    /**
     * This is the tier captured when the application was created. For the person's live tier use `person.tier`
     */
    personTier?: string;
    placementRequestStatus: PlacementRequestStatus;
    requestedPlacementArrivalDate?: string;
    requestedPlacementDuration?: number;
};


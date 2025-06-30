/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FullPerson } from './FullPerson';
import type { PlacementRequestStatus } from './PlacementRequestStatus';
import type { RestrictedPerson } from './RestrictedPerson';
import type { UnknownPerson } from './UnknownPerson';
export type Cas1PlacementRequestSummary = {
    applicationId?: string;
    applicationSubmittedDate?: string;
    firstBookingArrivalDate?: string;
    firstBookingPremisesName?: string;
    id: string;
    isParole: boolean;
    person: (FullPerson | RestrictedPerson | UnknownPerson);
    personTier?: string;
    placementRequestStatus: PlacementRequestStatus;
    requestedPlacementArrivalDate?: string;
    requestedPlacementDuration?: number;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Person } from './Person';
export type Cas1PlacementRequestSummary = {
    requestedPlacementDuration?: number;
    requestedPlacementArrivalDate?: string;
    id: string;
    person: Person;
    personTier?: string;
    applicationId?: string;
    placementRequestStatus: 'matched' | 'unableToMatch' | 'notMatched';
    applicationSubmittedDate?: string;
    isParole: boolean;
    firstBookingPremisesName?: string;
    firstBookingArrivalDate?: string;
};


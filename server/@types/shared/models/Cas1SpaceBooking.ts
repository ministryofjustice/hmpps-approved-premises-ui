/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesUser } from './ApprovedPremisesUser';
import type { Cas1ChangeRequestSummary } from './Cas1ChangeRequestSummary';
import type { Cas1KeyWorkerAllocation } from './Cas1KeyWorkerAllocation';
import type { Cas1SpaceBookingAction } from './Cas1SpaceBookingAction';
import type { Cas1SpaceBookingCancellation } from './Cas1SpaceBookingCancellation';
import type { Cas1SpaceBookingDates } from './Cas1SpaceBookingDates';
import type { Cas1SpaceBookingDeparture } from './Cas1SpaceBookingDeparture';
import type { Cas1SpaceBookingNonArrival } from './Cas1SpaceBookingNonArrival';
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
import type { FullPerson } from './FullPerson';
import type { NamedId } from './NamedId';
import type { RestrictedPerson } from './RestrictedPerson';
import type { TemporaryAccommodationUser } from './TemporaryAccommodationUser';
import type { UnknownPerson } from './UnknownPerson';
export type Cas1SpaceBooking = {
    actualArrivalDate?: string;
    actualArrivalDateOnly?: string;
    actualArrivalTime?: string;
    actualDepartureDate?: string;
    actualDepartureDateOnly?: string;
    actualDepartureTime?: string;
    allowedActions: Array<Cas1SpaceBookingAction>;
    apArea: NamedId;
    applicationId: string;
    assessmentId?: string;
    bookedBy?: (ApprovedPremisesUser | TemporaryAccommodationUser);
    cancellation?: Cas1SpaceBookingCancellation;
    canonicalArrivalDate: string;
    canonicalDepartureDate: string;
    characteristics: Array<Cas1SpaceCharacteristic>;
    createdAt: string;
    deliusEventNumber?: string;
    departure?: Cas1SpaceBookingDeparture;
    expectedArrivalDate: string;
    expectedDepartureDate: string;
    id: string;
    keyWorkerAllocation?: Cas1KeyWorkerAllocation;
    nonArrival?: Cas1SpaceBookingNonArrival;
    openChangeRequests: Array<Cas1ChangeRequestSummary>;
    otherBookingsInPremisesForCrn: Array<Cas1SpaceBookingDates>;
    person: (FullPerson | RestrictedPerson | UnknownPerson);
    placementRequestId?: string;
    premises: NamedId;
    reason?: string;
    requestForPlacementId?: string;
    tier?: string;
};


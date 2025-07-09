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
import type { Cas1SpaceBookingSummaryStatus } from './Cas1SpaceBookingSummaryStatus';
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
import type { FullPerson } from './FullPerson';
import type { NamedId } from './NamedId';
import type { RestrictedPerson } from './RestrictedPerson';
import type { TemporaryAccommodationUser } from './TemporaryAccommodationUser';
import type { UnknownPerson } from './UnknownPerson';
export type Cas1SpaceBooking = {
    actualArrivalDate?: string;
    /**
     * Use actualArrivalDate
     */
    actualArrivalDateOnly?: string;
    /**
     * This value may not be defined even if an arrival date is
     */
    actualArrivalTime?: string;
    actualDepartureDate?: string;
    /**
     * Use actualDepartureDate
     */
    actualDepartureDateOnly?: string;
    /**
     * This value may not be defined even if a departure date is
     */
    actualDepartureTime?: string;
    allowedActions: Array<Cas1SpaceBookingAction>;
    apArea: NamedId;
    applicationId: string;
    assessmentId?: string;
    bookedBy?: (ApprovedPremisesUser | TemporaryAccommodationUser);
    cancellation?: Cas1SpaceBookingCancellation;
    /**
     * actual arrival date or, if not known, the expected arrival date.
     */
    canonicalArrivalDate: string;
    /**
     * actual departure date or, if not known, the expected departure date
     */
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
    /**
     * use the better named 'placementRequestId'
     */
    requestForPlacementId?: string;
    status?: Cas1SpaceBookingSummaryStatus;
    tier?: string;
};


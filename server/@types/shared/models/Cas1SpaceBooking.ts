/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesUser } from './ApprovedPremisesUser';
import type { Cas1KeyWorkerAllocation } from './Cas1KeyWorkerAllocation';
import type { Cas1SpaceBookingCancellation } from './Cas1SpaceBookingCancellation';
import type { Cas1SpaceBookingDates } from './Cas1SpaceBookingDates';
import type { Cas1SpaceBookingDeparture } from './Cas1SpaceBookingDeparture';
import type { Cas1SpaceBookingNonArrival } from './Cas1SpaceBookingNonArrival';
import type { Cas1SpaceBookingRequirements } from './Cas1SpaceBookingRequirements';
import type { Cas1SpaceBookingSummaryStatus } from './Cas1SpaceBookingSummaryStatus';
import type { FullPerson } from './FullPerson';
import type { NamedId } from './NamedId';
import type { RestrictedPerson } from './RestrictedPerson';
import type { TemporaryAccommodationUser } from './TemporaryAccommodationUser';
import type { UnknownPerson } from './UnknownPerson';
export type Cas1SpaceBooking = {
    id: string;
    applicationId: string;
    person: (FullPerson | RestrictedPerson | UnknownPerson);
    requirements: Cas1SpaceBookingRequirements;
    premises: NamedId;
    apArea: NamedId;
    expectedArrivalDate: string;
    expectedDepartureDate: string;
    /**
     * actual arrival date or, if not known, the expected arrival date
     */
    canonicalArrivalDate: string;
    /**
     * actual departure date or, if not known, the expected departure date
     */
    canonicalDepartureDate: string;
    createdAt: string;
    otherBookingsInPremisesForCrn: Array<Cas1SpaceBookingDates>;
    assessmentId?: string;
    tier?: string;
    bookedBy?: (ApprovedPremisesUser | TemporaryAccommodationUser);
    requestForPlacementId?: string;
    /**
     * Use actualArrivalDateOnly and actualArrivalTime
     */
    actualArrivalDate?: string;
    actualArrivalDateOnly?: string;
    /**
     * This value may not be defined even if an arrival date is
     */
    actualArrivalTime?: string;
    /**
     * Use actualDepartureDateOnly and actualDepartureTime
     */
    actualDepartureDate?: string;
    actualDepartureDateOnly?: string;
    /**
     * This value may not be defined even if a departure date is
     */
    actualDepartureTime?: string;
    departure?: Cas1SpaceBookingDeparture;
    keyWorkerAllocation?: Cas1KeyWorkerAllocation;
    cancellation?: Cas1SpaceBookingCancellation;
    nonArrival?: Cas1SpaceBookingNonArrival;
    deliusEventNumber?: string;
    status?: Cas1SpaceBookingSummaryStatus;
};


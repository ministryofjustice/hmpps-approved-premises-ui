/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1KeyWorkerAllocation } from './Cas1KeyWorkerAllocation';
import type { Cas1SpaceBookingCancellation } from './Cas1SpaceBookingCancellation';
import type { Cas1SpaceBookingDates } from './Cas1SpaceBookingDates';
import type { Cas1SpaceBookingDeparture } from './Cas1SpaceBookingDeparture';
import type { Cas1SpaceBookingNonArrival } from './Cas1SpaceBookingNonArrival';
import type { Cas1SpaceBookingRequirements } from './Cas1SpaceBookingRequirements';
import type { Cas1SpaceBookingSummaryStatus } from './Cas1SpaceBookingSummaryStatus';
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
import type { NamedId } from './NamedId';
import type { Person } from './Person';
import type { User } from './User';
export type Cas1SpaceBooking = {
    id: string;
    applicationId: string;
    assessmentId?: string;
    person: Person;
    tier?: string;
    requirements: Cas1SpaceBookingRequirements;
    premises: NamedId;
    apArea: NamedId;
    bookedBy?: User;
    requestForPlacementId?: string;
    expectedArrivalDate: string;
    expectedDepartureDate: string;
    /**
     * Use actualArrivalDateOnly and actualArrivalTime
     * @deprecated
     */
    actualArrivalDate?: string;
    actualArrivalDateOnly?: string;
    /**
     * This value may not be defined even if an arrival date is
     */
    actualArrivalTime?: string;
    /**
     * Use actualDepartureDateOnly and actualDepartureTime
     * @deprecated
     */
    actualDepartureDate?: string;
    actualDepartureDateOnly?: string;
    /**
     * This value may not be defined even if a departure date is
     */
    actualDepartureTime?: string;
    /**
     * actual arrival date or, if not known, the expected arrival date
     */
    canonicalArrivalDate: string;
    /**
     * actual departure date or, if not known, the expected departure date
     */
    canonicalDepartureDate: string;
    departure?: Cas1SpaceBookingDeparture;
    createdAt: string;
    keyWorkerAllocation?: Cas1KeyWorkerAllocation;
    otherBookingsInPremisesForCrn: Array<Cas1SpaceBookingDates>;
    cancellation?: Cas1SpaceBookingCancellation;
    nonArrival?: Cas1SpaceBookingNonArrival;
    deliusEventNumber?: string;
    status?: Cas1SpaceBookingSummaryStatus;
    characteristics: Array<Cas1SpaceCharacteristic>;
};


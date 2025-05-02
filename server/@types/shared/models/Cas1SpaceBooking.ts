/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ChangeRequestSummary } from './Cas1ChangeRequestSummary';
import type { Cas1KeyWorkerAllocation } from './Cas1KeyWorkerAllocation';
import type { Cas1SpaceBookingCancellation } from './Cas1SpaceBookingCancellation';
import type { Cas1SpaceBookingDates } from './Cas1SpaceBookingDates';
import type { Cas1SpaceBookingDeparture } from './Cas1SpaceBookingDeparture';
import type { Cas1SpaceBookingNonArrival } from './Cas1SpaceBookingNonArrival';
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
    premises: NamedId;
    apArea: NamedId;
    bookedBy?: User;
    /**
     * use the better named 'placementRequestId'
     * @deprecated
     */
    requestForPlacementId?: string;
    placementRequestId?: string;
    expectedArrivalDate: string;
    expectedDepartureDate: string;
    actualArrivalDate?: string;
    /**
     * Use actualArrivalDate
     * @deprecated
     */
    actualArrivalDateOnly?: string;
    /**
     * This value may not be defined even if an arrival date is
     */
    actualArrivalTime?: string;
    actualDepartureDate?: string;
    /**
     * Use actualDepartureDate
     * @deprecated
     */
    actualDepartureDateOnly?: string;
    /**
     * This value may not be defined even if a departure date is
     */
    actualDepartureTime?: string;
    /**
     * actual arrival date or, if not known, the expected arrival date.
     * @deprecated
     */
    canonicalArrivalDate: string;
    /**
     * actual departure date or, if not known, the expected departure date
     * @deprecated
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
    allowedActions: any;
    openChangeRequests: Array<Cas1ChangeRequestSummary>;
};


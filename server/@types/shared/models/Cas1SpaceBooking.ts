/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1KeyWorkerAllocation } from './Cas1KeyWorkerAllocation';
import type { Cas1SpaceBookingCancellation } from './Cas1SpaceBookingCancellation';
import type { Cas1SpaceBookingDates } from './Cas1SpaceBookingDates';
import type { Cas1SpaceBookingRequirements } from './Cas1SpaceBookingRequirements';
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
    actualArrivalDate?: string;
    actualDepartureDate?: string;
    /**
     * actual arrival date or, if not known, the expected arrival date
     */
    canonicalArrivalDate: string;
    /**
     * actual departure date or, if not known, the expected departure date
     */
    canonicalDepartureDate: string;
    departureReason?: NamedId;
    departureMoveOnCategory?: NamedId;
    createdAt: string;
    keyWorkerAllocation?: Cas1KeyWorkerAllocation;
    otherBookingsInPremisesForCrn: Array<Cas1SpaceBookingDates>;
    cancellation?: Cas1SpaceBookingCancellation;
    deliusEventNumber?: string;
};


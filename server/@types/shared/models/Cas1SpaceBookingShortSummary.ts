/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesUser } from './ApprovedPremisesUser';
import type { Cas1KeyWorkerAllocation } from './Cas1KeyWorkerAllocation';
import type { Cas1SpaceBookingCancellation } from './Cas1SpaceBookingCancellation';
import type { Cas1SpaceBookingDeparture } from './Cas1SpaceBookingDeparture';
import type { Cas1SpaceBookingNonArrival } from './Cas1SpaceBookingNonArrival';
import type { Cas1SpaceBookingStatus } from './Cas1SpaceBookingStatus';
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
import type { NamedId } from './NamedId';
import type { TemporaryAccommodationUser } from './TemporaryAccommodationUser';
import type { TransferReason } from './TransferReason';
export type Cas1SpaceBookingShortSummary = {
    actualArrivalDate?: string;
    actualDepartureDate?: string;
    additionalInformation?: string;
    apArea: NamedId;
    bookedBy?: (ApprovedPremisesUser | TemporaryAccommodationUser);
    cancellation?: Cas1SpaceBookingCancellation;
    characteristics: Array<Cas1SpaceCharacteristic>;
    createdAt?: string;
    deliusEventNumber?: string;
    departure?: Cas1SpaceBookingDeparture;
    expectedArrivalDate: string;
    expectedDepartureDate: string;
    id: string;
    isNonArrival?: boolean;
    keyWorkerAllocation?: Cas1KeyWorkerAllocation;
    nonArrival?: Cas1SpaceBookingNonArrival;
    premises: NamedId;
    status?: Cas1SpaceBookingStatus;
    transferReason?: TransferReason;
};


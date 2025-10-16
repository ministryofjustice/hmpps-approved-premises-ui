/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1SpaceBookingCancellation } from './Cas1SpaceBookingCancellation';
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
import type { NamedId } from './NamedId';
export type Cas1SpaceBookingShortSummary = {
    actualArrivalDate?: string;
    actualDepartureDate?: string;
    apArea: NamedId;
    cancellation?: Cas1SpaceBookingCancellation;
    characteristics: Array<Cas1SpaceCharacteristic>;
    createdAt?: string;
    deliusEventNumber?: string;
    expectedArrivalDate: string;
    expectedDepartureDate: string;
    id: string;
    isNonArrival?: boolean;
    premises: NamedId;
};


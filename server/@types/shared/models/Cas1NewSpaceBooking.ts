/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1SpaceBookingRequirements } from './Cas1SpaceBookingRequirements';
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
export type Cas1NewSpaceBooking = {
    arrivalDate: string;
    characteristics?: Array<Cas1SpaceCharacteristic>;
    departureDate: string;
    premisesId: string;
    /**
     * @deprecated
     */
    requirements?: Cas1SpaceBookingRequirements;
};


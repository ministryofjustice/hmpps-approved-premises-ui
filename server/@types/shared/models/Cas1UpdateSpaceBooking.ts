/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1SpaceBookingCharacteristic } from './Cas1SpaceBookingCharacteristic';
export type Cas1UpdateSpaceBooking = {
    /**
     * Only provided if the arrival date has changed
     */
    arrivalDate?: string;
    /**
     * Only provided if the departure date has changed
     */
    departureDate?: string;
    /**
     * Only provided if characteristics have changed
     */
    characteristics?: Array<Cas1SpaceBookingCharacteristic>;
};


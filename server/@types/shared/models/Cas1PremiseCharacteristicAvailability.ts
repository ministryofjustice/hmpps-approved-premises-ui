/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1SpaceBookingCharacteristic } from './Cas1SpaceBookingCharacteristic';
export type Cas1PremiseCharacteristicAvailability = {
    /**
     * the number of available beds with this characteristic
     */
    availableBedsCount: number;
    /**
     * the number of bookings requiring this characteristic
     */
    bookingsCount: number;
    characteristic: Cas1SpaceBookingCharacteristic;
};


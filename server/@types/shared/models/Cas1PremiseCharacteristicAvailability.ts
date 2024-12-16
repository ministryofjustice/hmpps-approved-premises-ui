/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
export type Cas1PremiseCharacteristicAvailability = {
    characteristic: Cas1SpaceCharacteristic;
    /**
     * the number of available beds with this characteristic
     */
    availableBedsCount: number;
    /**
     * the number of bookings requiring this characteristic
     */
    bookingsCount: number;
};


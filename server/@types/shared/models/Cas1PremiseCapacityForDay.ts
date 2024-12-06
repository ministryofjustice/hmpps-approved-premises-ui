/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1PremiseCharacteristicAvailability } from './Cas1PremiseCharacteristicAvailability';
export type Cas1PremiseCapacityForDay = {
    date: string;
    /**
     * total bed count including temporarily unavailable beds (e.g. out of service beds). this does not consider bookings.
     */
    totalBedCount: number;
    /**
     * total bed count excluding temporarily unavailable beds (e.g. out of service beds). this does not consider bookings.
     */
    availableBedCount: number;
    /**
     * total number of bookings in the premise on that day
     */
    bookingCount: number;
    characteristicAvailability: Array<Cas1PremiseCharacteristicAvailability>;
};


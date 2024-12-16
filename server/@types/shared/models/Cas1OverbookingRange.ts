/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * over-bookings for the next 12 weeks
 */
export type Cas1OverbookingRange = {
    startInclusive: string;
    /**
     * This can be the same as the start date if overbooked for one night
     */
    endInclusive: string;
};


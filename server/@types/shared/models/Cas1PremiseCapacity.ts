/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1PremiseCapacityForDay } from './Cas1PremiseCapacityForDay';
export type Cas1PremiseCapacity = {
    startDate: string;
    endDate: string;
    /**
     * Capacity for each day, returning chronologically (oldest first)
     */
    capacity: Array<Cas1PremiseCapacityForDay>;
};


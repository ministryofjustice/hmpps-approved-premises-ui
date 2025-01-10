/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1PremiseCapacityForDay } from './Cas1PremiseCapacityForDay';
import type { Cas1Premises } from './Cas1Premises';
export type Cas1PremiseCapacity = {
    premise: Cas1Premises;
    startDate: string;
    endDate: string;
    /**
     * Capacity for each day, returning chronologically (oldest first)
     */
    capacity: Array<Cas1PremiseCapacityForDay>;
};


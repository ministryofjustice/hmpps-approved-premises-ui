/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1PremiseCapacityForDay } from './Cas1PremiseCapacityForDay';
import type { Cas1PremisesSummary } from './Cas1PremisesSummary';
export type Cas1PremiseCapacity = {
    premise: Cas1PremisesSummary;
    startDate: string;
    endDate: string;
    /**
     * Capacity for each day, returning chronologically (oldest first)
     */
    capacity: Array<Cas1PremiseCapacityForDay>;
};


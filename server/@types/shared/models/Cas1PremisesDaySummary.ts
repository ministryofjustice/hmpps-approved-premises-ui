/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1OutOfServiceBedSummary } from './Cas1OutOfServiceBedSummary';
import type { Cas1PremiseCapacityForDay } from './Cas1PremiseCapacityForDay';
import type { Cas1SpaceBookingDaySummary } from './Cas1SpaceBookingDaySummary';
import type { Cas1SpaceBookingSummary } from './Cas1SpaceBookingSummary';
export type Cas1PremisesDaySummary = {
    forDate: string;
    previousDate: string;
    nextDate: string;
    capacity: Cas1PremiseCapacityForDay;
    /**
     * @deprecated
     */
    spaceBookings: Array<Cas1SpaceBookingDaySummary>;
    spaceBookingSummaries: Array<Cas1SpaceBookingSummary>;
    outOfServiceBeds: Array<Cas1OutOfServiceBedSummary>;
};


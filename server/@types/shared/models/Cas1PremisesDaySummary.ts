/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1OutOfServiceBedSummary } from './Cas1OutOfServiceBedSummary';
import type { Cas1PremiseCapacityForDay } from './Cas1PremiseCapacityForDay';
import type { Cas1SpaceBookingDaySummary } from './Cas1SpaceBookingDaySummary';
export type Cas1PremisesDaySummary = {
    forDate: string;
    previousDate: string;
    nextDate: string;
    capacity: Cas1PremiseCapacityForDay;
    spaceBookings: Array<Cas1SpaceBookingDaySummary>;
    outOfServiceBeds: Array<Cas1OutOfServiceBedSummary>;
};


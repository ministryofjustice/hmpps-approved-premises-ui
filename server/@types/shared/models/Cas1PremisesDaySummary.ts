/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1OutOfServiceBedSummary } from './Cas1OutOfServiceBedSummary';
import type { Cas1SpaceBookingSummary } from './Cas1SpaceBookingSummary';
export type Cas1PremisesDaySummary = {
    forDate: string;
    nextDate: string;
    outOfServiceBeds: Array<Cas1OutOfServiceBedSummary>;
    previousDate: string;
    spaceBookingSummaries: Array<Cas1SpaceBookingSummary>;
};


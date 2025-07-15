/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
export type Cas1PremiseCapacitySummary = {
    date: string;
    /**
     * The room characteristic this value relates to. If null, this value is based upon bookings vs total beds
     */
    forRoomCharacteristic?: Cas1SpaceCharacteristic;
    inServiceBedCount: number;
    vacantBedCount: number;
};


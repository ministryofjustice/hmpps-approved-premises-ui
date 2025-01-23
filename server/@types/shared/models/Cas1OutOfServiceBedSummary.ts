/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1OutOfServiceBedReason } from './Cas1OutOfServiceBedReason';
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
export type Cas1OutOfServiceBedSummary = {
    id: string;
    bedId: string;
    roomName?: string;
    startDate: string;
    endDate: string;
    reason: Cas1OutOfServiceBedReason;
    characteristics: Array<Cas1SpaceCharacteristic>;
};


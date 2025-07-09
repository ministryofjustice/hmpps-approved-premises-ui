/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1OutOfServiceBedReason } from './Cas1OutOfServiceBedReason';
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
export type Cas1OutOfServiceBedSummary = {
    bedId: string;
    characteristics: Array<Cas1SpaceCharacteristic>;
    /**
     * This date is inclusive. The bed will be unavailable for the whole of the day
     */
    endDate: string;
    id: string;
    reason: Cas1OutOfServiceBedReason;
    roomName?: string;
    startDate: string;
};


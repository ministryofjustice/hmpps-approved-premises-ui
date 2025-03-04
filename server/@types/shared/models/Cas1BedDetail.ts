/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BedStatus } from './BedStatus';
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
export type Cas1BedDetail = {
    id: string;
    name: string;
    roomName: string;
    status: BedStatus;
    characteristics: Array<Cas1SpaceCharacteristic>;
};


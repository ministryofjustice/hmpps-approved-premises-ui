/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
export type Cas1NationalOccupancyParameters = {
    /**
     * Can be empty
     */
    cruManagementAreaIds: Array<string>;
    fromDate: string;
    postcodeArea?: string;
    /**
     * Can be empty
     */
    premisesCharacteristics: Array<Cas1SpaceCharacteristic>;
    /**
     * Can be empty
     */
    roomCharacteristics: Array<Cas1SpaceCharacteristic>;
};


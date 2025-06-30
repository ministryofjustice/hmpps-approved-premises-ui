/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
export type Cas1NewPlannedTransfer = {
    /**
     * The expected arrival date for the new space booking. The existing space booking will be updated to end on this date
     */
    arrivalDate: string;
    changeRequestId: string;
    /**
     * If not provided, it is assumed that no characteristics are required
     */
    characteristics?: Array<Cas1SpaceCharacteristic>;
    /**
     * The expected departure date for the new space booking
     */
    departureDate: string;
    destinationPremisesId: string;
};


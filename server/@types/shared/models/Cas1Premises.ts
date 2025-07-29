/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApArea } from './ApArea';
import type { Cas1OverbookingRange } from './Cas1OverbookingRange';
import type { Cas1PremisesLocalRestrictionSummary } from './Cas1PremisesLocalRestrictionSummary';
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
export type Cas1Premises = {
    apArea: ApArea;
    apCode: string;
    /**
     * The total number of beds available at this moment in time
     */
    availableBeds: number;
    /**
     * The total number of beds in this premises
     */
    bedCount: number;
    /**
     * Room and premise characteristics
     */
    characteristics: Array<Cas1SpaceCharacteristic>;
    /**
     * Full address, excluding postcode
     */
    fullAddress: string;
    id: string;
    /**
     * A list of restrictions that apply specifically to this approved premises.
     */
    localRestrictions?: Array<Cas1PremisesLocalRestrictionSummary>;
    managerDetails?: string;
    name: string;
    /**
     * The total number of out of service beds at this moment in time
     */
    outOfServiceBeds: number;
    /**
     * This is deprecated and only returns an empty list
     * @deprecated
     */
    overbookingSummary: Array<Cas1OverbookingRange>;
    postcode: string;
    supportsSpaceBookings: boolean;
};


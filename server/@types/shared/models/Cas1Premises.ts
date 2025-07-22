/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApArea } from './ApArea';
import type { Cas1OverbookingRange } from './Cas1OverbookingRange';
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
     * Full address, excluding postcode
     */
    fullAddress: string;
    id: string;
    /**
     * A list of restrictions that apply specifically to this approved premises.
     */
    localRestrictions?: Array<string>;
    managerDetails?: string;
    name: string;
    /**
     * The total number of out of service beds at this moment in time
     */
    outOfServiceBeds: number;
    /**
     * over-bookings for the next 12 weeks
     */
    overbookingSummary: Array<Cas1OverbookingRange>;
    postcode: string;
    supportsSpaceBookings: boolean;
};


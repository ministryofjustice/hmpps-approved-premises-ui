/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApArea } from './ApArea';
import type { Cas1OverbookingRange } from './Cas1OverbookingRange';
export type Cas1Premises = {
    id: string;
    name: string;
    apCode: string;
    /**
     * Full address, excluding postcode
     */
    fullAddress: string;
    postcode: string;
    apArea: ApArea;
    /**
     * The total number of beds in this premises
     */
    bedCount: number;
    /**
     * The total number of beds available at this moment in time
     */
    availableBeds: number;
    /**
     * The total number of out of service beds at this moment in time
     */
    outOfServiceBeds: number;
    supportsSpaceBookings: boolean;
    managerDetails?: string;
    /**
     * over-bookings for the next 12 weeks
     */
    overbookingSummary: Array<Cas1OverbookingRange>;
};


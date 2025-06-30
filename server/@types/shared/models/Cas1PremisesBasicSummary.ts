/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NamedId } from './NamedId';
export type Cas1PremisesBasicSummary = {
    apArea: NamedId;
    apCode?: string;
    bedCount: number;
    /**
     * Full address, excluding postcode
     */
    fullAddress: string;
    id: string;
    name: string;
    postcode: string;
    supportsSpaceBookings: boolean;
};


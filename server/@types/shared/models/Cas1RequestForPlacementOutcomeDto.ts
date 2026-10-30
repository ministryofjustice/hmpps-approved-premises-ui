/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ExternalPlacementDto } from './Cas1ExternalPlacementDto';
import type { Cas1ExternalRequestForPlacementDto } from './Cas1ExternalRequestForPlacementDto';
/**
 * Details about a request for placement and, if defined, one of its placements.
 * |If an RfP has many placements, many of these instances will exists
 */
export type Cas1RequestForPlacementOutcomeDto = {
    /**
     * The most recent status change date, or expected arrival date if placement exists in the future
     */
    dateApplied: string;
    placement?: Cas1ExternalPlacementDto;
    requestForPlacement: Cas1ExternalRequestForPlacementDto;
};


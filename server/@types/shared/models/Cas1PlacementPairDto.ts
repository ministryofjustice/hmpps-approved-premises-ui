/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ExternalPlacementDto } from './Cas1ExternalPlacementDto';
import type { Cas1ExternalRequestForPlacementDto } from './Cas1ExternalRequestForPlacementDto';
/**
 * Details about a placement, with it's associated request for placement
 */
export type Cas1PlacementPairDto = {
    dateApplied: string;
    placement?: Cas1ExternalPlacementDto;
    requestForPlacement?: Cas1ExternalRequestForPlacementDto;
};


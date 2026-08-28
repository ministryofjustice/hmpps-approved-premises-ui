/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ExternalApplicationDto } from './Cas1ExternalApplicationDto';
import type { Cas1ExternalAssessmentDto } from './Cas1ExternalAssessmentDto';
import type { Cas1ExternalPlacementDto } from './Cas1ExternalPlacementDto';
import type { Cas1ExternalRequestForPlacementDto } from './Cas1ExternalRequestForPlacementDto';
import type { Cas1PlacementPairDto } from './Cas1PlacementPairDto';
/**
 * Details about the most current application, with associated assessment, request for placement and placement
 */
export type Cas1SuitableApplication = {
    application: Cas1ExternalApplicationDto;
    assessment?: Cas1ExternalAssessmentDto;
    placement?: Cas1ExternalPlacementDto;
    placementHistory: Array<Cas1PlacementPairDto>;
    requestForPlacement?: Cas1ExternalRequestForPlacementDto;
    uiUrl: string;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ExternalAssessmentDto } from './Cas1ExternalAssessmentDto';
import type { Cas1ExternalRequestForPlacementOutcomeDto } from './Cas1ExternalRequestForPlacementOutcomeDto';
export type Cas1ExternalSubmittedApplicationDto = {
    assessment?: Cas1ExternalAssessmentDto;
    requestForPlacementHistory: Array<Cas1ExternalRequestForPlacementOutcomeDto>;
    submittedAt: string;
    upcomingRequestForPlacement?: Cas1ExternalRequestForPlacementOutcomeDto;
};


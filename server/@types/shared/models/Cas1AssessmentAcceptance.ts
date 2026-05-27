/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PlacementDates } from './PlacementDates';
import type { PlacementRequirements } from './PlacementRequirements';
/**
 * Information needed to accept an assessment
 */
export type Cas1AssessmentAcceptance = {
    agreeWithShortNoticeReason?: boolean;
    agreeWithShortNoticeReasonComments?: string;
    document: any;
    notes?: string;
    placementDates?: PlacementDates;
    reasonForLateApplication?: string;
    requirements: PlacementRequirements;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1AssessmentRejectionReasonDto } from './Cas1AssessmentRejectionReasonDto';
export type Cas1AssessmentRejection = {
    agreeWithShortNoticeReason?: boolean;
    agreeWithShortNoticeReasonComments?: string;
    document: any;
    reasonForLateApplication?: string;
    /**
     * A human readable description of the reason the assessment was rejected. This is free text.
     */
    rejectionRationale: string;
    /**
     * An enumeration for the reason the assessment was rejected. This can reliably drive behaviour, such as which email is sent when an application is rejected.
     */
    rejectionReason: Cas1AssessmentRejectionReasonDto;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1OASysAssessmentMetadata } from './Cas1OASysAssessmentMetadata';
import type { Cas1OASysSupportingInformationQuestionMetaData } from './Cas1OASysSupportingInformationQuestionMetaData';
export type Cas1OASysMetadata = {
    assessmentMetadata: Cas1OASysAssessmentMetadata;
    /**
     * Supporting information specifies which optional questions/answers are available for inclusion in an application
     */
    supportingInformation: Array<Cas1OASysSupportingInformationQuestionMetaData>;
};


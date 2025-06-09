/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1OASysAssessmentMetadata } from './Cas1OASysAssessmentMetadata';
import type { Cas1OASysGroupName } from './Cas1OASysGroupName';
import type { OASysQuestion } from './OASysQuestion';
/**
 * Groups questions and answers from OAsys. Groups directly align with OAsys Sections other than 'needs', which collates questions from multiple sections
 */
export type Cas1OASysGroup = {
    group: Cas1OASysGroupName;
    assessmentMetadata: Cas1OASysAssessmentMetadata;
    answers: Array<OASysQuestion>;
};


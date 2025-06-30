/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1OASysAssessmentMetadata } from './Cas1OASysAssessmentMetadata';
import type { Cas1OASysGroupName } from './Cas1OASysGroupName';
import type { OASysQuestion } from './OASysQuestion';
export type Cas1OASysGroup = {
    answers: Array<OASysQuestion>;
    assessmentMetadata: Cas1OASysAssessmentMetadata;
    group: Cas1OASysGroupName;
};


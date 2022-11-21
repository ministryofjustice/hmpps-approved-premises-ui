/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ArrayOfOASysOffenceAnalysisQuestions } from './ArrayOfOASysOffenceAnalysisQuestions';
import type { OASysAssessmentId } from './OASysAssessmentId';
import type { OASysAssessmentState } from './OASysAssessmentState';

export type OASysOffenceAnalysis = {
    assessmentId: OASysAssessmentId;
    assessmentState?: OASysAssessmentState;
    /**
     * If the assessment is completed this is the date it was completed, otherwise it is the date it was initiated
     */
    date?: string;
    offenceAnalysis: ArrayOfOASysOffenceAnalysisQuestions;
};


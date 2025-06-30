/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Cas1OASysSupportingInformationQuestionMetaData = {
    /**
     * If the user can optionally elect to include this question in an application. If not optional, it will always be returned by calls to '/cas1/people/{crn}/oasys/answers'
     */
    inclusionOptional: boolean;
    /**
     * If the response to this question in OASys for the person has been identified as 'linked to harm'
     */
    oasysAnswerLinkedToHarm?: boolean;
    /**
     * If the response to this question in OAsys for the person hsa been identified as 'linked to re-offending'
     */
    oasysAnswerLinkedToReOffending?: boolean;
    /**
     * The OAsys section that this question relates to
     */
    section: number;
    sectionLabel: string;
};


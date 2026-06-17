/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Cas1OASysSupportingInformationQuestionMetaData = {
    /**
     * If false this question/answer will always be returned for the supportingInformation answers. Otherwise it has to be explicitly included
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


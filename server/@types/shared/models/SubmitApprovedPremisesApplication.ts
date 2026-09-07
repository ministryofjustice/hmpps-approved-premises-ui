/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApType } from './ApType';
import type { Cas1ApplicationTimelinessCategory } from './Cas1ApplicationTimelinessCategory';
import type { Cas1ApplicationUserDetails } from './Cas1ApplicationUserDetails';
import type { Cas1RequestedPlacementPeriod } from './Cas1RequestedPlacementPeriod';
import type { ReleaseTypeOption } from './ReleaseTypeOption';
import type { SentenceTypeOption } from './SentenceTypeOption';
import type { SituationOption } from './SituationOption';
export type SubmitApprovedPremisesApplication = {
    apAreaId?: string;
    apType: ApType;
    applicantUserDetails?: Cas1ApplicationUserDetails;
    /**
     * Default placement duration in days. Should be provided even if no requestedPlacementPeriod is defined. Can be null if calculation is not possible
     */
    calculatedPlacementDuration?: number;
    caseManagerIsNotApplicant?: boolean;
    caseManagerUserDetails?: Cas1ApplicationUserDetails;
    /**
     * Use requestedPlacementDuration instead, which a better named version of this field
     * @deprecated
     */
    duration?: number;
    /**
     * noticeType should be used to indicate if this an emergency application
     * @deprecated
     */
    isEmergencyApplication?: boolean;
    /**
     * If true this is an exceptional application (The case does not meet the CAS1 eligibility criteria, but a senior manager has agreed that the application can proceed)
     */
    isExceptional?: boolean;
    isWomensApplication?: boolean;
    licenseExpiryDate?: string;
    noticeType?: Cas1ApplicationTimelinessCategory;
    reasonForShortNotice?: string;
    reasonForShortNoticeOther?: string;
    releaseType: ReleaseTypeOption;
    /**
     * The placement duration requested by the applicant, which may be the default duration if not overridden. This will be provided even if requestedPlacementPeriod is null. Required on submission. nullable until 'duration' is removed
     */
    requestedPlacementDuration?: number;
    /**
     * The applicant can make a single request for placement as part of the initial application
     */
    requestedPlacementPeriod?: Cas1RequestedPlacementPeriod;
    sentenceType: SentenceTypeOption;
    situation?: SituationOption;
    targetLocation: string;
    /**
     * Any object
     */
    translatedDocument?: any;
    type: string;
};


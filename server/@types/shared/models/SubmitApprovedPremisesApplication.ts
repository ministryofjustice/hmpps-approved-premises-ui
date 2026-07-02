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
    /**
     * If the user's ap area id is incorrect, they can optionally override it for the application
     */
    apAreaId?: string;
    apType: ApType;
    applicantUserDetails?: Cas1ApplicationUserDetails;
    /**
     * If the applicant has requested a placement, this is the requested arrival date
     * @deprecated
     */
    arrivalDate?: string;
    caseManagerIsNotApplicant?: boolean;
    caseManagerUserDetails?: Cas1ApplicationUserDetails;
    /**
     * If the applicant has requested a placement, this is the requested duration in days
     * @deprecated
     */
    duration?: number;
    /**
     * noticeType should be used to indicate if this an emergency application
     * @deprecated
     */
    isEmergencyApplication?: boolean;
    isWomensApplication?: boolean;
    licenseExpiryDate?: string;
    noticeType?: Cas1ApplicationTimelinessCategory;
    reasonForShortNotice?: string;
    reasonForShortNoticeOther?: string;
    releaseType: ReleaseTypeOption;
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


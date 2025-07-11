/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApArea } from './ApArea';
import type { ApprovedPremisesApplicationStatus } from './ApprovedPremisesApplicationStatus';
import type { ApType } from './ApType';
import type { AssessmentDecision } from './AssessmentDecision';
import type { Cas1ApplicationUserDetails } from './Cas1ApplicationUserDetails';
import type { Cas1CruManagementArea } from './Cas1CruManagementArea';
import type { FullPerson } from './FullPerson';
import type { PersonRisks } from './PersonRisks';
import type { PersonStatus } from './PersonStatus';
import type { RestrictedPerson } from './RestrictedPerson';
import type { UnknownPerson } from './UnknownPerson';
export type Cas1Application = {
    apArea?: ApArea;
    apType?: ApType;
    applicantUserDetails?: Cas1ApplicationUserDetails;
    arrivalDate?: string;
    assessmentDecision?: AssessmentDecision;
    assessmentDecisionDate?: string;
    assessmentId?: string;
    /**
     * If true, caseManagerUserDetails will provide case manager details. Otherwise, applicantUserDetails can be used for case manager details
     */
    caseManagerIsNotApplicant?: boolean;
    caseManagerUserDetails?: Cas1ApplicationUserDetails;
    createdAt: string;
    createdByUserId: string;
    cruManagementArea?: Cas1CruManagementArea;
    /**
     * Any object
     */
    data?: any;
    /**
     * Any object
     */
    document?: any;
    id: string;
    isEmergencyApplication?: boolean;
    /**
     * Use apType
     * @deprecated
     */
    isEsapApplication?: boolean;
    /**
     * Use apType
     * @deprecated
     */
    isPipeApplication?: boolean;
    isWomensApplication?: boolean;
    licenceExpiryDate?: string;
    person: (FullPerson | RestrictedPerson | UnknownPerson);
    personStatusOnSubmission?: PersonStatus;
    risks?: PersonRisks;
    status: ApprovedPremisesApplicationStatus;
    submittedAt?: string;
};


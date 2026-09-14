/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesApplicationStatus } from './ApprovedPremisesApplicationStatus';
import type { FullPersonSummary } from './FullPersonSummary';
import type { PersonRisks } from './PersonRisks';
import type { ReleaseTypeOption } from './ReleaseTypeOption';
import type { RestrictedPersonSummary } from './RestrictedPersonSummary';
import type { UnknownPersonSummary } from './UnknownPersonSummary';
export type Cas1ApplicationSummary = {
    arrivalDate?: string;
    createdAt: string;
    createdByUserId: string;
    createdByUserName?: string;
    hasRequestsForPlacement: boolean;
    id: string;
    isEmergencyApplication?: boolean;
    isEsapApplication?: boolean;
    isPipeApplication?: boolean;
    isWithdrawn: boolean;
    isWomensApplication?: boolean;
    person: (FullPersonSummary | RestrictedPersonSummary | UnknownPersonSummary);
    releaseType?: ReleaseTypeOption;
    risks?: PersonRisks;
    status: ApprovedPremisesApplicationStatus;
    submittedAt?: string;
    /**
     * The tier value from when the application was created. For the person's live tier use person.tier
     */
    tier?: string;
};


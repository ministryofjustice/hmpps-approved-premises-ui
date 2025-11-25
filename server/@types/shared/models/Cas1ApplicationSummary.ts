/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesApplicationStatus } from './ApprovedPremisesApplicationStatus';
import type { FullPerson } from './FullPerson';
import type { PersonRisks } from './PersonRisks';
import type { ReleaseTypeOption } from './ReleaseTypeOption';
import type { RestrictedPerson } from './RestrictedPerson';
import type { UnknownPerson } from './UnknownPerson';
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
    person: (FullPerson | RestrictedPerson | UnknownPerson);
    releaseType?: ReleaseTypeOption;
    risks?: PersonRisks;
    status: ApprovedPremisesApplicationStatus;
    submittedAt?: string;
    tier?: string;
};


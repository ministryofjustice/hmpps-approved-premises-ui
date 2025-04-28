/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesApplicationStatus } from './ApprovedPremisesApplicationStatus';
import type { Person } from './Person';
import type { PersonRisks } from './PersonRisks';
import type { ReleaseTypeOption } from './ReleaseTypeOption';
export type Cas1ApplicationSummary = {
    id: string;
    person: Person;
    createdAt: string;
    submittedAt?: string;
    isWomensApplication?: boolean;
    isPipeApplication?: boolean;
    isEmergencyApplication?: boolean;
    isEsapApplication?: boolean;
    arrivalDate?: string;
    risks?: PersonRisks;
    createdByUserId: string;
    status: ApprovedPremisesApplicationStatus;
    tier?: string;
    isWithdrawn: boolean;
    releaseType?: ReleaseTypeOption;
    hasRequestsForPlacement: boolean;
};


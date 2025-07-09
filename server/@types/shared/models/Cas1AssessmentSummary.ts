/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssessmentDecision } from './AssessmentDecision';
import type { Cas1AssessmentStatus } from './Cas1AssessmentStatus';
import type { FullPerson } from './FullPerson';
import type { PersonRisks } from './PersonRisks';
import type { RestrictedPerson } from './RestrictedPerson';
import type { UnknownPerson } from './UnknownPerson';
export type Cas1AssessmentSummary = {
    applicationId: string;
    arrivalDate?: string;
    createdAt: string;
    dateOfInfoRequest?: string;
    decision?: AssessmentDecision;
    dueAt: string;
    id: string;
    person: (FullPerson | RestrictedPerson | UnknownPerson);
    risks?: PersonRisks;
    status: Cas1AssessmentStatus;
};


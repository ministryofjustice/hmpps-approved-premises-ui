/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssessmentDecision } from './AssessmentDecision';
import type { Cas1AssessmentStatus } from './Cas1AssessmentStatus';
import type { FullPersonSummary } from './FullPersonSummary';
import type { PersonRisks } from './PersonRisks';
import type { RestrictedPersonSummary } from './RestrictedPersonSummary';
import type { UnknownPersonSummary } from './UnknownPersonSummary';
export type Cas1AssessmentSummary = {
    applicationId: string;
    arrivalDate?: string;
    createdAt: string;
    dateOfInfoRequest?: string;
    decision?: AssessmentDecision;
    dueAt: string;
    id: string;
    person: (FullPersonSummary | RestrictedPersonSummary | UnknownPersonSummary);
    risks?: PersonRisks;
    status: Cas1AssessmentStatus;
};


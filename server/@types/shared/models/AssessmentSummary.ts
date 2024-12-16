/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssessmentDecision } from './AssessmentDecision';
import type { FullPerson } from './FullPerson';
import type { PersonRisks } from './PersonRisks';
import type { RestrictedPerson } from './RestrictedPerson';
import type { UnknownPerson } from './UnknownPerson';
export type AssessmentSummary = {
    id: string;
    type: string;
    applicationId: string;
    dateOfInfoRequest?: string;
    arrivalDate?: string;
    decision?: AssessmentDecision;
    createdAt: string;
    person: (FullPerson | RestrictedPerson | UnknownPerson);
    risks?: PersonRisks;
};


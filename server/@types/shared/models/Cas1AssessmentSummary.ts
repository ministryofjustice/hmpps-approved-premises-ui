/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssessmentDecision } from './AssessmentDecision';
import type { Cas1AssessmentStatus } from './Cas1AssessmentStatus';
import type { Person } from './Person';
import type { PersonRisks } from './PersonRisks';
export type Cas1AssessmentSummary = {
    id: string;
    applicationId: string;
    arrivalDate?: string;
    createdAt: string;
    dateOfInfoRequest?: string;
    decision?: AssessmentDecision;
    risks?: PersonRisks;
    person: Person;
    status: Cas1AssessmentStatus;
    dueAt: string;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesUser } from './ApprovedPremisesUser';
import type { AssessmentDecision } from './AssessmentDecision';
import type { Cas1Application } from './Cas1Application';
import type { Cas1AssessmentStatus } from './Cas1AssessmentStatus';
import type { Cas1ClarificationNote } from './Cas1ClarificationNote';
import type { Unit } from './Unit';
export type Cas1Assessment = {
    id: string;
    schemaVersion: string;
    outdatedSchema: boolean;
    createdAt: string;
    allocatedAt?: string;
    submittedAt?: string;
    decision?: AssessmentDecision;
    rejectionRationale?: string;
    data?: Unit;
    clarificationNotes: Array<Cas1ClarificationNote>;
    application: Cas1Application;
    allocatedToStaffMember?: ApprovedPremisesUser;
    status?: Cas1AssessmentStatus;
    createdFromAppeal: boolean;
    document?: Unit;
};


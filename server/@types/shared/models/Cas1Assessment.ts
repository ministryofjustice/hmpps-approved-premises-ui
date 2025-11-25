/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesUser } from './ApprovedPremisesUser';
import type { AssessmentDecision } from './AssessmentDecision';
import type { Cas1Application } from './Cas1Application';
import type { Cas1AssessmentStatus } from './Cas1AssessmentStatus';
import type { Cas1ClarificationNote } from './Cas1ClarificationNote';
export type Cas1Assessment = {
    allocatedAt?: string;
    allocatedToStaffMember?: ApprovedPremisesUser;
    application: Cas1Application;
    clarificationNotes: Array<Cas1ClarificationNote>;
    createdAt: string;
    createdFromAppeal: boolean;
    data?: any;
    decision?: AssessmentDecision;
    document?: any;
    id: string;
    rejectionRationale?: string;
    status?: Cas1AssessmentStatus;
    submittedAt?: string;
};


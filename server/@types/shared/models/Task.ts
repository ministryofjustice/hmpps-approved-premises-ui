/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApArea } from './ApArea';
import type { ApprovedPremisesUser } from './ApprovedPremisesUser';
import type { FullPersonSummary } from './FullPersonSummary';
import type { ProbationDeliveryUnit } from './ProbationDeliveryUnit';
import type { RestrictedPersonSummary } from './RestrictedPersonSummary';
import type { TaskStatus } from './TaskStatus';
import type { TaskType } from './TaskType';
import type { UnknownPersonSummary } from './UnknownPersonSummary';
export type Task = {
    id: string;
    applicationId: string;
    personSummary: (FullPersonSummary | RestrictedPersonSummary | UnknownPersonSummary);
    outcomeRecordedAt?: string;
    crn: string;
    taskType: TaskType;
    /**
     * The Due date of the task - this is deprecated in favour of the `dueAt` field
     */
    dueDate: string;
    status: TaskStatus;
    dueAt: string;
    apArea?: ApArea;
    /**
     * Superseded by personSummary which provides 'name' as well as 'personType' and 'crn'.
     */
    personName: string;
    probationDeliveryUnit?: ProbationDeliveryUnit;
    allocatedToStaffMember?: ApprovedPremisesUser;
};


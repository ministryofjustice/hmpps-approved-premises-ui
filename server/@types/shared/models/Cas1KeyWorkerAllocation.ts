/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StaffMember } from './StaffMember';
import type { UserSummary } from './UserSummary';
export type Cas1KeyWorkerAllocation = {
    allocatedAt?: string;
    /**
     * Once keyWorkerUser is non optional, this will be removed
     * @deprecated
     */
    keyWorker: StaffMember;
    keyWorkerUser?: UserSummary;
};


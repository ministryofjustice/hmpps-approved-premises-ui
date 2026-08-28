/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesApplicationStatus } from './ApprovedPremisesApplicationStatus';
import type { Cas1StaffDto } from './Cas1StaffDto';
export type Cas1ExternalApplicationDto = {
    createdAt: string;
    createdBy: Cas1StaffDto;
    expiresAt?: string;
    id: string;
    status: ApprovedPremisesApplicationStatus;
    submittedAt?: string;
};


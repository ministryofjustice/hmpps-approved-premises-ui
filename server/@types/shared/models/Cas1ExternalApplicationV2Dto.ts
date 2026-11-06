/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesApplicationStatus } from './ApprovedPremisesApplicationStatus';
import type { Cas1ExternalSubmittedApplicationDto } from './Cas1ExternalSubmittedApplicationDto';
import type { Cas1StaffDto } from './Cas1StaffDto';
export type Cas1ExternalApplicationV2Dto = {
    createdAt: string;
    createdBy: Cas1StaffDto;
    expiresAt?: string;
    id: string;
    status: ApprovedPremisesApplicationStatus;
    /**
     * Only populated once the application has been submitted
     */
    submittedApplication?: Cas1ExternalSubmittedApplicationDto;
    uiUrl: string;
};


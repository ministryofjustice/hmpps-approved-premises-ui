/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LicenceConditions } from './LicenceConditions';
import type { LicenceStatus } from './LicenceStatus';
import type { LicenceType } from './LicenceType';
export type Licence = {
    approvedByUsername?: string;
    approvedDateTime?: string;
    bookingId?: number;
    conditions: LicenceConditions;
    createdByUsername?: string;
    createdDateTime?: string;
    crn?: string;
    id: number;
    isInPssPeriod?: boolean;
    kind?: string;
    licenceStartDate?: string;
    licenceType: LicenceType;
    policyVersion?: string;
    prisonNumber?: string;
    statusCode: LicenceStatus;
    updatedByUsername?: string;
    updatedDateTime?: string;
    version?: string;
};


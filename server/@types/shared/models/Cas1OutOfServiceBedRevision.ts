/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesUser } from './ApprovedPremisesUser';
import type { Cas1OutOfServiceBedReason } from './Cas1OutOfServiceBedReason';
import type { Cas1OutOfServiceBedRevisionType } from './Cas1OutOfServiceBedRevisionType';
import type { TemporaryAccommodationUser } from './TemporaryAccommodationUser';
export type Cas1OutOfServiceBedRevision = {
    id: string;
    updatedAt: string;
    revisionType: Array<Cas1OutOfServiceBedRevisionType>;
    updatedBy?: (ApprovedPremisesUser | TemporaryAccommodationUser);
    startDate?: string;
    endDate?: string;
    reason?: Cas1OutOfServiceBedReason;
    referenceNumber?: string;
    notes?: string;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesUser } from './ApprovedPremisesUser';
import type { Cas1OutOfServiceBedReason } from './Cas1OutOfServiceBedReason';
import type { Cas1OutOfServiceBedRevisionType } from './Cas1OutOfServiceBedRevisionType';
import type { TemporaryAccommodationUser } from './TemporaryAccommodationUser';
export type Cas1OutOfServiceBedRevision = {
    endDate?: string;
    id: string;
    notes?: string;
    reason?: Cas1OutOfServiceBedReason;
    referenceNumber?: string;
    revisionType: Array<Cas1OutOfServiceBedRevisionType>;
    startDate?: string;
    updatedAt: string;
    updatedBy?: (ApprovedPremisesUser | TemporaryAccommodationUser);
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1OutOfServiceBedCancellation } from './Cas1OutOfServiceBedCancellation';
import type { Cas1OutOfServiceBedReason } from './Cas1OutOfServiceBedReason';
import type { Cas1OutOfServiceBedRevision } from './Cas1OutOfServiceBedRevision';
import type { Cas1OutOfServiceBedStatus } from './Cas1OutOfServiceBedStatus';
import type { NamedId } from './NamedId';
import type { Temporality } from './Temporality';
export type Cas1OutOfServiceBed = {
    apArea: NamedId;
    bed: NamedId;
    cancellation?: Cas1OutOfServiceBedCancellation;
    createdAt: string;
    daysLostCount: number;
    /**
     * This date is inclusive. The bed will be unavailable for the whole of the day
     */
    endDate: string;
    id: string;
    notes?: string;
    premises: NamedId;
    reason: Cas1OutOfServiceBedReason;
    referenceNumber?: string;
    revisionHistory: Array<Cas1OutOfServiceBedRevision>;
    room: NamedId;
    startDate: string;
    status: Cas1OutOfServiceBedStatus;
    temporality: Temporality;
};


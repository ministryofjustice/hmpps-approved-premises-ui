/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1StaffDto } from './Cas1StaffDto';
import type { PlacementApplicationDecision } from './PlacementApplicationDecision';
import type { RequestForPlacementStatus } from './RequestForPlacementStatus';
import type { WithdrawPlacementRequestReason } from './WithdrawPlacementRequestReason';
export type Cas1ExternalRequestForPlacementDto = {
    decision?: PlacementApplicationDecision;
    durationDays?: number;
    expectedArrivalDate?: string;
    rejectionReason?: string;
    status?: RequestForPlacementStatus;
    submittedAt?: string;
    submittedBy?: Cas1StaffDto;
    withdrawalDate?: string;
    withdrawalReason?: WithdrawPlacementRequestReason;
};


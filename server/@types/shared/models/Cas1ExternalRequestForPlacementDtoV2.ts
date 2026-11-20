/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ExternalRequestForPlacementWithdrawalDto } from './Cas1ExternalRequestForPlacementWithdrawalDto';
import type { Cas1StaffDto } from './Cas1StaffDto';
import type { PlacementApplicationDecision } from './PlacementApplicationDecision';
import type { RequestForPlacementStatus } from './RequestForPlacementStatus';
export type Cas1ExternalRequestForPlacementDtoV2 = {
    decision?: PlacementApplicationDecision;
    durationDays?: number;
    /**
     * The requested arrival date. This may be different to the booked arrival date (check placements for this)
     */
    expectedArrivalDate: string;
    rejectionReason?: string;
    status: RequestForPlacementStatus;
    statusLastUpdated: string;
    submittedAt: string;
    submittedBy: Cas1StaffDto;
    withdrawal?: Cas1ExternalRequestForPlacementWithdrawalDto;
};


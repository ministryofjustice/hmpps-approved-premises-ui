/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesApplicationStatus } from './ApprovedPremisesApplicationStatus';
import type { Cas1SpaceBookingStatus } from './Cas1SpaceBookingStatus';
import type { Cas1StaffDto } from './Cas1StaffDto';
import type { RequestForPlacementStatus } from './RequestForPlacementStatus';
import type { ServiceType } from './ServiceType';
import type { WithdrawPlacementRequestReason } from './WithdrawPlacementRequestReason';
export type Cas1ReferralHistory = {
    applicationId: string;
    applicationStatus: ApprovedPremisesApplicationStatus;
    date: string;
    id: string;
    localAuthorityArea?: string;
    pdu?: string;
    placementAddress?: string;
    placementStatus?: Cas1SpaceBookingStatus;
    referralRejectionReason?: string;
    referredBy: Cas1StaffDto;
    requestForPlacementStatus?: RequestForPlacementStatus;
    type: ServiceType;
    uiUrl: string;
    withdrawalReason?: WithdrawPlacementRequestReason;
};


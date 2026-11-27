/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WithdrawPlacementRequestReason } from './WithdrawPlacementRequestReason';
/**
 * There is a small number of older withdrawn request for placements for which reason and/or date were not captured
 */
export type Cas1ExternalRequestForPlacementWithdrawalDto = {
    withdrawalDate?: string;
    withdrawalReason?: WithdrawPlacementRequestReason;
};


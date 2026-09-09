/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1RequestedPlacementPeriod } from './Cas1RequestedPlacementPeriod';
import type { PlacementApplicationType } from './PlacementApplicationType';
import type { WithdrawPlacementRequestReason } from './WithdrawPlacementRequestReason';
/**
 * The API model used when constructing, submitting and approving a PlacementApplication. Once approved this is represented by a RequestForPlacement type
 */
export type PlacementApplication = {
    applicationCompletedAt: string;
    applicationId: string;
    assessmentCompletedAt: string;
    /**
     * If type is 'Additional', provides the PlacementApplication ID. If type is 'Initial' this field shouldn't be used.
     */
    assessmentId: string;
    canBeWithdrawn: boolean;
    createdAt: string;
    createdByUserId: string;
    data?: any;
    document?: any;
    /**
     * If type is 'Additional', provides the PlacementApplication ID. If type is 'Initial' this field provides a PlacementRequest ID.
     */
    id: string;
    isWithdrawn: boolean;
    requestedPlacementPeriod?: Cas1RequestedPlacementPeriod;
    submittedAt?: string;
    type: PlacementApplicationType;
    withdrawalReason?: WithdrawPlacementRequestReason;
};


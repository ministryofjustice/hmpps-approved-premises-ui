/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1SpaceBookingStatus } from './Cas1SpaceBookingStatus';
import type { RequestForPlacementStatus } from './RequestForPlacementStatus';
export type Cas1PlacementHistory = {
    dateApplied: string;
    placementStatus?: Cas1SpaceBookingStatus;
    requestForPlacementStatus: RequestForPlacementStatus;
};


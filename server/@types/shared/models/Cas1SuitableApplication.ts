/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesApplicationStatus } from './ApprovedPremisesApplicationStatus';
import type { Cas1PlacementHistory } from './Cas1PlacementHistory';
import type { Cas1SpaceBookingStatus } from './Cas1SpaceBookingStatus';
import type { RequestForPlacementStatus } from './RequestForPlacementStatus';
export type Cas1SuitableApplication = {
    applicationStatus: ApprovedPremisesApplicationStatus;
    id: string;
    placementHistories: Array<Cas1PlacementHistory>;
    placementStatus?: Cas1SpaceBookingStatus;
    requestForPlacementStatus?: RequestForPlacementStatus;
};


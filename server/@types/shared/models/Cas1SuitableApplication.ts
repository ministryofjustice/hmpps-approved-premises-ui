/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesApplicationStatus } from './ApprovedPremisesApplicationStatus';
import type { Cas1SpaceBookingStatus } from './Cas1SpaceBookingStatus';
export type Cas1SuitableApplication = {
    applicationStatus: ApprovedPremisesApplicationStatus;
    id: string;
    placementStatus?: Cas1SpaceBookingStatus;
};


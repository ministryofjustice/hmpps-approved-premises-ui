/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesApplicationStatus } from './ApprovedPremisesApplicationStatus';
import type { Cas1ExternalPremisesDto } from './Cas1ExternalPremisesDto';
import type { Cas1SpaceBookingStatus } from './Cas1SpaceBookingStatus';
import type { RequestForPlacementStatus } from './RequestForPlacementStatus';
export type Cas1SuitableApplication = {
    applicationStatus: ApprovedPremisesApplicationStatus;
    id: string;
    placementStatus?: Cas1SpaceBookingStatus;
    premises?: Cas1ExternalPremisesDto;
    requestForPlacementStatus?: RequestForPlacementStatus;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesApplicationStatus } from './ApprovedPremisesApplicationStatus';
import type { Cas1SpaceBookingStatus } from './Cas1SpaceBookingStatus';
import type { Cas1SuitablePremisesDto } from './Cas1SuitablePremisesDto';
import type { RequestForPlacementStatus } from './RequestForPlacementStatus';
export type Cas1SuitableApplication = {
    applicationStatus: ApprovedPremisesApplicationStatus;
    id: string;
    placementStatus?: Cas1SpaceBookingStatus;
    premises?: Cas1SuitablePremisesDto;
    requestForPlacementStatus?: RequestForPlacementStatus;
};


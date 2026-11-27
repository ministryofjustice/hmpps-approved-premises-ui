/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ExternalPremisesV2Dto } from './Cas1ExternalPremisesV2Dto';
import type { Cas1SpaceBookingStatus } from './Cas1SpaceBookingStatus';
export type Cas1ExternalPlacementV2Dto = {
    actualArrivalDate?: string;
    actualDepartureDate?: string;
    cancellationReason?: string;
    canonicalArrivalDate: string;
    canonicalDepartureDate: string;
    expectedArrivalDate: string;
    expectedDepartureDate: string;
    premises: Cas1ExternalPremisesV2Dto;
    status: Cas1SpaceBookingStatus;
    statusLastUpdated: string;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ExternalPremisesDto } from './Cas1ExternalPremisesDto';
import type { Cas1SpaceBookingStatus } from './Cas1SpaceBookingStatus';
export type Cas1ExternalPlacementDto = {
    actualArrivalDate?: string;
    actualDepartureDate?: string;
    cancellationReason?: string;
    premises?: Cas1ExternalPremisesDto;
    status?: Cas1SpaceBookingStatus;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ChangeRequestType } from './Cas1ChangeRequestType';
import type { Unit } from './Unit';
export type Cas1NewChangeRequest = {
    spaceBookingId: string;
    type: Cas1ChangeRequestType;
    requestJson: Unit;
    reasonId: string;
};


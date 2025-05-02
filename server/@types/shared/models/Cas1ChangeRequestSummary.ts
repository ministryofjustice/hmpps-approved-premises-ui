/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ChangeRequestType } from './Cas1ChangeRequestType';
import type { PersonSummary } from './PersonSummary';
export type Cas1ChangeRequestSummary = {
    id: string;
    person: PersonSummary;
    type: Cas1ChangeRequestType;
    createdAt: string;
    tier?: string;
    expectedArrivalDate: string;
    actualArrivalDate?: string;
    placementRequestId: string;
};


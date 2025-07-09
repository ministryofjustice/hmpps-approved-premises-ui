/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ChangeRequestType } from './Cas1ChangeRequestType';
import type { FullPersonSummary } from './FullPersonSummary';
import type { RestrictedPersonSummary } from './RestrictedPersonSummary';
import type { UnknownPersonSummary } from './UnknownPersonSummary';
export type Cas1ChangeRequestSummary = {
    actualArrivalDate?: string;
    createdAt: string;
    expectedArrivalDate: string;
    id: string;
    person: (FullPersonSummary | RestrictedPersonSummary | UnknownPersonSummary);
    placementRequestId: string;
    tier?: string;
    type: Cas1ChangeRequestType;
};


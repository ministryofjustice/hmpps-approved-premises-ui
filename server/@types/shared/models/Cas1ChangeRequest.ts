/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ChangeRequestDecision } from './Cas1ChangeRequestDecision';
import type { Cas1ChangeRequestType } from './Cas1ChangeRequestType';
import type { NamedId } from './NamedId';
import type { PersonSummary } from './PersonSummary';
import type { Unit } from './Unit';
export type Cas1ChangeRequest = {
    id: string;
    person: PersonSummary;
    type: Cas1ChangeRequestType;
    createdAt: string;
    tier?: string;
    expectedArrivalDate?: string;
    actualArrivalDate?: string;
    /**
     * Current placement's length of stay, using canonical arrival date
     */
    lengthOfStayDays: number;
    requestReason: NamedId;
    decision?: Cas1ChangeRequestDecision;
    decisionJson?: Record<string, Unit>;
    rejectionReason?: NamedId;
    updatedAt: string;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ChangeRequestDecision } from './Cas1ChangeRequestDecision';
import type { Cas1ChangeRequestType } from './Cas1ChangeRequestType';
import type { NamedId } from './NamedId';
import type { Unit } from './Unit';
export type Cas1ChangeRequest = {
    id: string;
    type: Cas1ChangeRequestType;
    createdAt: string;
    requestReason: NamedId;
    decision?: Cas1ChangeRequestDecision;
    decisionJson?: Unit;
    rejectionReason?: NamedId;
    updatedAt: string;
};


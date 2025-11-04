/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ChangeRequestDecision } from './Cas1ChangeRequestDecision';
import type { Cas1ChangeRequestType } from './Cas1ChangeRequestType';
import type { NamedId } from './NamedId';
export type Cas1ChangeRequest = {
    createdAt: string;
    decision?: Cas1ChangeRequestDecision;
    decisionJson?: any;
    id: string;
    rejectionReason?: NamedId;
    requestJson: any;
    requestReason: NamedId;
    spaceBookingId: string;
    type: Cas1ChangeRequestType;
    updatedAt: string;
};


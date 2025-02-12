/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ChangeRequestType } from './Cas1ChangeRequestType';
export type Cas1ChangeRequestSummary = {
    type: Cas1ChangeRequestType;
    created_at: string;
    resolution?: 'approved' | 'rejected';
    resolved_at?: string;
    crn: string;
};


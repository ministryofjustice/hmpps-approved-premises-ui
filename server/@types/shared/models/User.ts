/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProbationDeliveryUnit } from './ProbationDeliveryUnit';
import type { ProbationRegion } from './ProbationRegion';
export type User = {
    region: ProbationRegion;
    name: string;
    id: string;
    isActive?: boolean;
    deliusUsername: string;
    telephoneNumber?: string;
    service: string;
    email?: string;
    probationDeliveryUnit?: ProbationDeliveryUnit;
};


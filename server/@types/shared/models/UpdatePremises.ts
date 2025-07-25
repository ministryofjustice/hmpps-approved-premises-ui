/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PropertyStatus } from './PropertyStatus';
/**
 * Information to update the premises with
 */
export type UpdatePremises = {
    addressLine1: string;
    addressLine2?: string;
    characteristicIds: Array<string>;
    localAuthorityAreaId?: string;
    name?: string;
    notes?: string;
    pdu?: string;
    postcode: string;
    probationDeliveryUnitId?: string;
    probationRegionId: string;
    status: PropertyStatus;
    town?: string;
    turnaroundWorkingDayCount?: number;
};


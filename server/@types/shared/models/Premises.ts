/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApArea } from './ApArea';
import type { Characteristic } from './Characteristic';
import type { LocalAuthorityArea } from './LocalAuthorityArea';
import type { ProbationRegion } from './ProbationRegion';
import type { PropertyStatus } from './PropertyStatus';
export type Premises = {
    name: string;
    id: string;
    probationRegion: ProbationRegion;
    addressLine1: string;
    addressLine2?: string;
    characteristics?: Array<Characteristic>;
    localAuthorityArea?: LocalAuthorityArea;
    status: PropertyStatus;
    service: string;
    town?: string;
    postcode: string;
    bedCount: number;
    apArea: ApArea;
    notes?: string;
    availableBedsForToday: number;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApType } from './ApType';
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
import type { NamedId } from './NamedId';
export type Cas1PremisesSearchResultSummary = {
    id: string;
    apType: ApType;
    name: string;
    /**
     * Full address, excluding postcode
     */
    fullAddress: string;
    postcode?: string;
    apArea: NamedId;
    /**
     * Room and premise characteristics
     */
    characteristics: Array<Cas1SpaceCharacteristic>;
};


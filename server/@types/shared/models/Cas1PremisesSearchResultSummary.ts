/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApType } from './ApType';
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
import type { NamedId } from './NamedId';
export type Cas1PremisesSearchResultSummary = {
    apArea: NamedId;
    apType: ApType;
    /**
     * Room and premise characteristics
     */
    characteristics: Array<Cas1SpaceCharacteristic>;
    /**
     * Full address, excluding postcode
     */
    fullAddress: string;
    id: string;
    /**
     * A list of restrictions that apply specifically to this approved premises.
     */
    localRestrictions: Array<string>;
    name: string;
    postcode?: string;
};


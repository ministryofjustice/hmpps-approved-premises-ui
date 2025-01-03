/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApType } from './ApType';
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
import type { CharacteristicPair } from './CharacteristicPair';
import type { NamedId } from './NamedId';
export type Cas1PremisesSearchResultSummary = {
    id: string;
    apType: ApType;
    name: string;
    /**
     * Full address, excluding postcode
     */
    fullAddress: string;
    /**
     * Deprecated, use fullAddress
     * @deprecated
     */
    addressLine1?: string;
    /**
     * Deprecated, use fullAddress
     * @deprecated
     */
    addressLine2?: string;
    /**
     * Deprecated, use fullAddress
     * @deprecated
     */
    town?: string;
    postcode?: string;
    apArea: NamedId;
    /**
     * This is not populated. Instead, use 'characteristics'
     * @deprecated
     */
    premisesCharacteristics?: Array<CharacteristicPair>;
    /**
     * Room and premise characteristics
     */
    characteristics: Array<Cas1SpaceCharacteristic>;
};


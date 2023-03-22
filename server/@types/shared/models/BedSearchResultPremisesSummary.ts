/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CharacteristicPair } from './CharacteristicPair';

export type BedSearchResultPremisesSummary = {
    id: string;
    name: string;
    addressLine1: string;
    addressLine2?: string;
    town?: string;
    postcode: string;
    characteristics: Array<CharacteristicPair>;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BedSearchResult } from './BedSearchResult';
/**
 * This is no longer returned by any APIs so should be removed once removed from UI Code
 * @deprecated
 */
export type ApprovedPremisesBedSearchResult = (BedSearchResult & {
    /**
     * how many miles away from the postcode district the Premises this Bed belongs to is
     */
    distanceMiles: number;
});


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1PremisesSearchResultSummary } from './Cas1PremisesSearchResultSummary';
import type { Cas1SpaceAvailability } from './Cas1SpaceAvailability';
export type Cas1SpaceSearchResult = {
    premises: Cas1PremisesSearchResultSummary;
    distanceInMiles: number;
    /**
     * This is not populated and will be removed in the future
     * @deprecated
     */
    spacesAvailable?: Array<Cas1SpaceAvailability>;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1RequestedPlacementPeriod } from './Cas1RequestedPlacementPeriod';
import type { PlacementDates } from './PlacementDates';
import type { PlacementType } from './PlacementType';
/**
 * Information needed to submit a placement application
 */
export type SubmitPlacementApplication = {
    /**
     * Please use requestedPlacementPeriods instead
     * @deprecated
     */
    placementDates?: Array<PlacementDates>;
    placementType: PlacementType;
    requestedPlacementPeriods?: Array<Cas1RequestedPlacementPeriod>;
    translatedDocument: any;
};


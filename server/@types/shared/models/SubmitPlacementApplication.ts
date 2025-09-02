/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1RequestedPlacementPeriod } from './Cas1RequestedPlacementPeriod';
import type { PlacementDates } from './PlacementDates';
import type { PlacementType } from './PlacementType';
import type { ReleaseTypeOption } from './ReleaseTypeOption';
import type { SentenceTypeOption } from './SentenceTypeOption';
import type { SituationOption } from './SituationOption';
/**
 * Information needed to submit a placement application
 */
export type SubmitPlacementApplication = {
    /**
     * Please use requestedPlacementPeriods instead
     * @deprecated
     */
    placementDates?: Array<PlacementDates>;
    /**
     * Please use release type instead
     * @deprecated
     */
    placementType?: PlacementType;
    releaseType?: ReleaseTypeOption;
    requestedPlacementPeriods?: Array<Cas1RequestedPlacementPeriod>;
    sentenceType?: SentenceTypeOption;
    situationType?: SituationOption;
    translatedDocument: any;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1RequestedPlacementPeriod } from './Cas1RequestedPlacementPeriod';
import type { ReleaseTypeOption } from './ReleaseTypeOption';
import type { SentenceTypeOption } from './SentenceTypeOption';
import type { SituationOption } from './SituationOption';
export type SubmitPlacementApplication = {
    releaseType: ReleaseTypeOption;
    requestedPlacementPeriods: Array<Cas1RequestedPlacementPeriod>;
    sentenceType?: SentenceTypeOption;
    situationType?: SituationOption;
    translatedDocument: any;
};


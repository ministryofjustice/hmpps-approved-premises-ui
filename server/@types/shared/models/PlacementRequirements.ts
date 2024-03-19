/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { UiPlacementCriteria } from '../../../utils/placementCriteriaUtils';
import type { ApType, TemporaryApplyApTypeAwaitingApiChange, TemporaryApplyApTypeAwaitingApiChangeButWithNormalInsteadOfStandard } from './ApType';
import type { Gender } from './Gender';
import type { PlacementCriteria } from './PlacementCriteria';
export type PlacementRequirements = {
    gender: Gender;
    type: ApType;
    location: string;
    radius: number;
    essentialCriteria: Array<PlacementCriteria>;
    desirableCriteria: Array<PlacementCriteria>;
};

export type TemporaryPlacementRequirementsAwaitingApiChange = {
    gender: Gender;
    type: TemporaryApplyApTypeAwaitingApiChangeButWithNormalInsteadOfStandard;
    location: string;
    radius: number;
    essentialCriteria: Array<UiPlacementCriteria>;
    desirableCriteria: Array<UiPlacementCriteria>;
};


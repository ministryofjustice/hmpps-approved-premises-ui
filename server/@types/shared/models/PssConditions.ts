/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ElectronicMonitoringAdditionalConditionWithRestriction } from './ElectronicMonitoringAdditionalConditionWithRestriction';
import type { GenericAdditionalCondition } from './GenericAdditionalCondition';
import type { MultipleExclusionZoneAdditionalCondition } from './MultipleExclusionZoneAdditionalCondition';
import type { SingleUploadAdditionalCondition } from './SingleUploadAdditionalCondition';
import type { StandardCondition } from './StandardCondition';
export type PssConditions = {
    additional: Array<(ElectronicMonitoringAdditionalConditionWithRestriction | GenericAdditionalCondition | MultipleExclusionZoneAdditionalCondition | SingleUploadAdditionalCondition)>;
    standard: Array<StandardCondition>;
};


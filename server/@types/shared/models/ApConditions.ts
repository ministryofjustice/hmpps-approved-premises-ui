/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BespokeCondition } from './BespokeCondition';
import type { ElectronicMonitoringAdditionalConditionWithRestriction } from './ElectronicMonitoringAdditionalConditionWithRestriction';
import type { GenericAdditionalCondition } from './GenericAdditionalCondition';
import type { MultipleExclusionZoneAdditionalCondition } from './MultipleExclusionZoneAdditionalCondition';
import type { SingleUploadAdditionalCondition } from './SingleUploadAdditionalCondition';
import type { StandardCondition } from './StandardCondition';
export type ApConditions = {
    additional: Array<(ElectronicMonitoringAdditionalConditionWithRestriction | GenericAdditionalCondition | MultipleExclusionZoneAdditionalCondition | SingleUploadAdditionalCondition)>;
    bespoke: Array<BespokeCondition>;
    standard: Array<StandardCondition>;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ValueWithMetadataListDietaryItemDto } from './ValueWithMetadataListDietaryItemDto';
import type { ValueWithMetadataString } from './ValueWithMetadataString';
export type DietAndAllergyDto = {
    cateringInstructions?: ValueWithMetadataString;
    foodAllergies?: ValueWithMetadataListDietaryItemDto;
    lastAdmissionDate?: string;
    medicalDietaryRequirements?: ValueWithMetadataListDietaryItemDto;
    personalisedDietaryRequirements?: ValueWithMetadataListDietaryItemDto;
    topLevelLocation?: string;
};


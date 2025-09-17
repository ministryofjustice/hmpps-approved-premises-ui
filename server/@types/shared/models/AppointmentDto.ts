/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OffenderFullDto } from './OffenderFullDto';
import type { OffenderLimitedDto } from './OffenderLimitedDto';
import type { OffenderNotFoundDto } from './OffenderNotFoundDto';
export type AppointmentDto = {
    id: number;
    /**
     * Project name
     */
    projectName: string;
    /**
     * How many community payback minutes the offender is required to complete
     */
    requirementMinutes: number;
    /**
     * How many community payback minutes the offender has completed to date
     */
    completedMinutes: number;
    offender: (OffenderFullDto | OffenderLimitedDto | OffenderNotFoundDto);
};


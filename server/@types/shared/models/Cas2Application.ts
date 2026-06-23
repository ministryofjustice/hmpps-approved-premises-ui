/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Application } from './Application';
import type { ApplicationOrigin } from './ApplicationOrigin';
import type { ApplicationStatus } from './ApplicationStatus';
import type { Cas2Assessment } from './Cas2Assessment';
import type { Cas2CohortDto } from './Cas2CohortDto';
import type { Cas2TimelineEvent } from './Cas2TimelineEvent';
import type { Cas2User } from './Cas2User';
export type Cas2Application = (Application & {
    applicationOrigin?: ApplicationOrigin;
    assessment?: Cas2Assessment;
    bailHearingDate?: string;
    cohort?: Cas2CohortDto;
    createdBy?: Cas2User;
    data?: any;
    document?: any;
    status?: ApplicationStatus;
    submittedAt?: string;
    telephoneNumber?: string;
    timelineEvents?: Array<Cas2TimelineEvent>;
} & {
    applicationOrigin: ApplicationOrigin;
    createdBy: Cas2User;
    status: ApplicationStatus;
});


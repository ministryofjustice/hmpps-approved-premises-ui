/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesUser } from './ApprovedPremisesUser';
import type { Cas1ApplicationStatus } from './Cas1ApplicationStatus';
import type { Cas1TimelineEvent } from './Cas1TimelineEvent';
import type { TemporaryAccommodationUser } from './TemporaryAccommodationUser';
export type Cas1ApplicationTimeline = {
    createdAt: string;
    createdBy?: (ApprovedPremisesUser | TemporaryAccommodationUser);
    id: string;
    isOfflineApplication: boolean;
    status?: Cas1ApplicationStatus;
    timelineEvents: Array<Cas1TimelineEvent>;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ApplicationStatus } from './Cas1ApplicationStatus';
import type { Cas1TimelineEvent } from './Cas1TimelineEvent';
import type { User } from './User';
export type Cas1ApplicationTimeline = {
    id: string;
    createdAt: string;
    isOfflineApplication: boolean;
    status?: Cas1ApplicationStatus;
    createdBy?: User;
    timelineEvents: Array<Cas1TimelineEvent>;
};


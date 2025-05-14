/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1TimelineEventAssociatedUrl } from './Cas1TimelineEventAssociatedUrl';
import type { Cas1TimelineEventContentPayload } from './Cas1TimelineEventContentPayload';
import type { Cas1TimelineEventType } from './Cas1TimelineEventType';
import type { Cas1TriggerSourceType } from './Cas1TriggerSourceType';
import type { User } from './User';
import type { UserSummary } from './UserSummary';
export type Cas1TimelineEvent = {
    type: Cas1TimelineEventType;
    id: string;
    occurredAt: string;
    content?: string;
    /**
     * Use createdBySummary
     * @deprecated
     */
    createdBy?: User;
    createdBySummary?: UserSummary;
    payload?: Cas1TimelineEventContentPayload;
    associatedUrls?: Array<Cas1TimelineEventAssociatedUrl>;
    triggerSource?: Cas1TriggerSourceType;
    schemaVersion?: number;
};


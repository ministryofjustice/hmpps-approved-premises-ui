/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1TimelineEventType } from './Cas1TimelineEventType';
import type { NamedId } from './NamedId';
/**
 * Base schema for all timeline event payloads
 */
export type Cas1TimelineEventContentPayload = {
    type: Cas1TimelineEventType;
    premises: NamedId;
    schemaVersion: number;
};


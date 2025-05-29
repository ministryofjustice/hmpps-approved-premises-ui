/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
import type { Cas1TimelineEventContentPayload } from './Cas1TimelineEventContentPayload';
import type { Cas1TimelineEventTransferInfo } from './Cas1TimelineEventTransferInfo';
import type { NamedId } from './NamedId';
export type Cas1BookingChangedContentPayload = (Cas1TimelineEventContentPayload & {
    premises: NamedId;
    expectedArrival: string;
    expectedDeparture: string;
    /**
     * Only populated if the new value is different, and where schema version = 2
     */
    previousExpectedArrival?: string;
    /**
     * Only populated if the new value is different, and where schema version = 2
     */
    previousExpectedDeparture?: string;
    characteristics?: Array<Cas1SpaceCharacteristic>;
    /**
     * Only populated if the new value is different, and where schema version = 2
     */
    previousCharacteristics?: Array<Cas1SpaceCharacteristic>;
    /**
     * This is deprecated, use the schema version information on the enclosing Cas1TimelineEvent
     * @deprecated
     */
    schemaVersion?: number;
    transferredTo?: Cas1TimelineEventTransferInfo;
});


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ChangeRequestType } from './Cas1ChangeRequestType';
import type { Cas1KeyWorkerAllocation } from './Cas1KeyWorkerAllocation';
import type { Cas1SpaceBookingStatus } from './Cas1SpaceBookingStatus';
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
import type { FullPersonSummary } from './FullPersonSummary';
import type { NamedId } from './NamedId';
import type { RestrictedPersonSummary } from './RestrictedPersonSummary';
import type { TransferReason } from './TransferReason';
import type { UnknownPersonSummary } from './UnknownPersonSummary';
export type Cas1SpaceBookingSummary = {
    actualArrivalDate?: string;
    actualDepartureDate?: string;
    additionalInformation?: string;
    /**
     * @deprecated
     */
    appealRequested?: boolean;
    canonicalArrivalDate: string;
    canonicalDepartureDate: string;
    characteristics: Array<Cas1SpaceCharacteristic>;
    createdAt?: string;
    deliusEventNumber?: string;
    expectedArrivalDate: string;
    expectedDepartureDate: string;
    id: string;
    isCancelled: boolean;
    isNonArrival?: boolean;
    keyWorkerAllocation?: Cas1KeyWorkerAllocation;
    openChangeRequestTypes: Array<Cas1ChangeRequestType>;
    person: (FullPersonSummary | RestrictedPersonSummary | UnknownPersonSummary);
    /**
     * @deprecated
     */
    plannedTransferRequested?: boolean;
    premises: NamedId;
    status?: Cas1SpaceBookingStatus;
    tier?: string;
    transferReason?: TransferReason;
};


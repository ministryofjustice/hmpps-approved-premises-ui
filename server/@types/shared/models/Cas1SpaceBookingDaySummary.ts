/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
import type { FullPersonSummary } from './FullPersonSummary';
import type { RestrictedPersonSummary } from './RestrictedPersonSummary';
import type { UnknownPersonSummary } from './UnknownPersonSummary';
export type Cas1SpaceBookingDaySummary = {
    /**
     * actual arrival date or, if not known, the expected arrival date
     */
    canonicalArrivalDate: string;
    /**
     * actual departure date or, if not known, the expected departure date
     */
    canonicalDepartureDate: string;
    essentialCharacteristics: Array<Cas1SpaceCharacteristic>;
    id: string;
    person: (FullPersonSummary | RestrictedPersonSummary | UnknownPersonSummary);
    releaseType?: string;
    /**
     * Risk rating tier level of corresponding application
     */
    tier?: string;
};


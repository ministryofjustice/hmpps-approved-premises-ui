/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1SpaceBookingCharacteristic } from './Cas1SpaceBookingCharacteristic';
import type { FullPersonSummary } from './FullPersonSummary';
import type { RestrictedPersonSummary } from './RestrictedPersonSummary';
import type { UnknownPersonSummary } from './UnknownPersonSummary';
export type Cas1SpaceBookingDaySummary = {
    id: string;
    person: (FullPersonSummary | RestrictedPersonSummary | UnknownPersonSummary);
    /**
     * actual arrival date or, if not known, the expected arrival date
     */
    canonicalArrivalDate: string;
    /**
     * actual departure date or, if not known, the expected departure date
     */
    canonicalDepartureDate: string;
    /**
     * Risk rating tier level of corresponding application
     */
    tier: string;
    releaseType: string;
    essentialCharacteristics: Array<Cas1SpaceBookingCharacteristic>;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
import type { PersonSummary } from './PersonSummary';
/**
 * @deprecated
 */
export type Cas1SpaceBookingDaySummary = {
    id: string;
    person: PersonSummary;
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
    tier?: string;
    releaseType?: string;
    essentialCharacteristics: Array<Cas1SpaceCharacteristic>;
};


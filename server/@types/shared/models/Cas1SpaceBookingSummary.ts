/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PersonSummary } from './PersonSummary';
import type { StaffMember } from './StaffMember';
export type Cas1SpaceBookingSummary = {
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
    keyWorker?: StaffMember;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1KeyWorkerAllocation } from './Cas1KeyWorkerAllocation';
import type { PersonSummary } from './PersonSummary';
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
    keyWorker?: Cas1KeyWorkerAllocation;
};


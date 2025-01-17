/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BookingSummary } from './BookingSummary';
import type { Person } from './Person';
import type { PersonRisks } from './PersonRisks';
import type { PlacementDates } from './PlacementDates';
import type { PlacementRequestStatus } from './PlacementRequestStatus';
import type { PlacementRequirements } from './PlacementRequirements';
export type DashboardPlacementRequest = (PlacementRequirements & PlacementDates & {
    id: string;
    person: Person;
    risks: PersonRisks;
    applicationId: string;
    status: PlacementRequestStatus;
    applicationDate: string;
    isParole: boolean;
    booking?: BookingSummary;
});


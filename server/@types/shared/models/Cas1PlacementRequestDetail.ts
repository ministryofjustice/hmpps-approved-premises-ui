/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesUser } from './ApprovedPremisesUser';
import type { ApType } from './ApType';
import type { AssessmentDecision } from './AssessmentDecision';
import type { Cas1Application } from './Cas1Application';
import type { Cas1ChangeRequestSummary } from './Cas1ChangeRequestSummary';
import type { Cas1RequestedPlacementPeriod } from './Cas1RequestedPlacementPeriod';
import type { Cas1SpaceBookingSummary } from './Cas1SpaceBookingSummary';
import type { FullPerson } from './FullPerson';
import type { PersonRisks } from './PersonRisks';
import type { PlacementCriteria } from './PlacementCriteria';
import type { PlacementRequestBookingSummary } from './PlacementRequestBookingSummary';
import type { PlacementRequestRequestType } from './PlacementRequestRequestType';
import type { PlacementRequestStatus } from './PlacementRequestStatus';
import type { ReleaseTypeOption } from './ReleaseTypeOption';
import type { RestrictedPerson } from './RestrictedPerson';
import type { UnknownPerson } from './UnknownPerson';
import type { WithdrawPlacementRequestReason } from './WithdrawPlacementRequestReason';
export type Cas1PlacementRequestDetail = {
    application: Cas1Application;
    applicationDate: string;
    applicationId: string;
    assessmentDate: string;
    assessmentDecision: AssessmentDecision;
    assessmentId: string;
    assessor: ApprovedPremisesUser;
    authorisedPlacementPeriod: Cas1RequestedPlacementPeriod;
    booking?: PlacementRequestBookingSummary;
    /**
     * Use Cas1RequestedPlacementPeriod instead
     * @deprecated
     */
    duration: number;
    essentialCriteria: Array<PlacementCriteria>;
    /**
     * Use Cas1RequestedPlacementPeriod instead
     * @deprecated
     */
    expectedArrival: string;
    id: string;
    isParole: boolean;
    isWithdrawn: boolean;
    legacyBooking?: PlacementRequestBookingSummary;
    /**
     * Postcode outcode
     */
    location: string;
    /**
     * Notes from the assessor for the CRU Manager
     */
    notes?: string;
    openChangeRequests: Array<Cas1ChangeRequestSummary>;
    person: (FullPerson | RestrictedPerson | UnknownPerson);
    radius: number;
    releaseType: ReleaseTypeOption;
    requestType?: PlacementRequestRequestType;
    requestedPlacementPeriod: Cas1RequestedPlacementPeriod;
    risks: PersonRisks;
    spaceBookings: Array<Cas1SpaceBookingSummary>;
    status: PlacementRequestStatus;
    type: ApType;
    withdrawalReason?: WithdrawPlacementRequestReason;
};


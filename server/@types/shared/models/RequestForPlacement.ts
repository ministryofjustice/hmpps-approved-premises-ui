/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1AuthorisedPlacementPeriod } from './Cas1AuthorisedPlacementPeriod';
import type { Cas1RequestedPlacementPeriod } from './Cas1RequestedPlacementPeriod';
import type { Cas1SpaceBookingShortSummary } from './Cas1SpaceBookingShortSummary';
import type { Cas1StaffDto } from './Cas1StaffDto';
import type { PlacementApplicationDecision } from './PlacementApplicationDecision';
import type { ReleaseTypeOption } from './ReleaseTypeOption';
import type { RequestForPlacementStatus } from './RequestForPlacementStatus';
import type { RequestForPlacementType } from './RequestForPlacementType';
import type { SentenceTypeOption } from './SentenceTypeOption';
import type { SituationOption } from './SituationOption';
import type { WithdrawPlacementRequestReason } from './WithdrawPlacementRequestReason';
export type RequestForPlacement = {
    authorisedPlacementPeriod?: Cas1AuthorisedPlacementPeriod;
    /**
     * If true, the user making this request can withdraw this request for placement.  If false, it may still be possible to indirectly withdraw this request for placement by withdrawing the application.
     */
    canBeDirectlyWithdrawn: boolean;
    canonicalPlacementPeriod: Cas1RequestedPlacementPeriod;
    createdAt: string;
    createdByUserId: string;
    decision?: PlacementApplicationDecision;
    document?: any;
    /**
     * If `type` is `"manual"`, provides the `PlacementApplication` ID. If `type` is `"automatic"` this field provides a `PlacementRequest` ID.
     */
    id: string;
    isWithdrawn: boolean;
    placements: Array<Cas1SpaceBookingShortSummary>;
    releaseType?: ReleaseTypeOption;
    /**
     * If `type` is `"manual"`, provides the value of `PlacementApplication.decisionMadeAt`. If `type` is `"automatic"` this field provides the value of `PlacementRequest.assessmentCompletedAt`.
     */
    requestReviewedAt?: string;
    requestedPlacementPeriod: Cas1RequestedPlacementPeriod;
    sentenceType?: SentenceTypeOption;
    situation?: SituationOption;
    status: RequestForPlacementStatus;
    statusSetDate: string;
    submittedAt?: string;
    submittedBy?: Cas1StaffDto;
    type: RequestForPlacementType;
    withdrawalReason?: WithdrawPlacementRequestReason;
};


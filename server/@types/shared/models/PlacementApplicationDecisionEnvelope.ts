/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1PlacementApplicationDecisionAcceptanceDto } from './Cas1PlacementApplicationDecisionAcceptanceDto';
import type { PlacementApplicationDecision } from './PlacementApplicationDecision';
export type PlacementApplicationDecisionEnvelope = {
    /**
     * Acceptance details for an Accepted decision. Optional for legacy clients; required when requested duration is null.
     */
    acceptance?: Cas1PlacementApplicationDecisionAcceptanceDto;
    decision: PlacementApplicationDecision;
    decisionSummary: string;
    summaryOfChanges: string;
};


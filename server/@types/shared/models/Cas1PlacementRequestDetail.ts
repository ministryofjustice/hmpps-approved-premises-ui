/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1Application } from './Cas1Application';
import type { Cas1ChangeRequestSummary } from './Cas1ChangeRequestSummary';
import type { Cas1SpaceBookingSummary } from './Cas1SpaceBookingSummary';
import type { PlacementRequest } from './PlacementRequest';
import type { PlacementRequestBookingSummary } from './PlacementRequestBookingSummary';
export type Cas1PlacementRequestDetail = (PlacementRequest & {
    application: Cas1Application;
    /**
     * The legacy booking associated with this placement request
     */
    legacyBooking?: PlacementRequestBookingSummary;
    /**
     * The space bookings associated with this placement request
     */
    spaceBookings: Array<Cas1SpaceBookingSummary>;
    openChangeRequests: Array<Cas1ChangeRequestSummary>;
});


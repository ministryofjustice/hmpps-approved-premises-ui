/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApArea } from './ApArea'
import type { Cas1OverbookingRange } from './Cas1OverbookingRange'
import { ApType } from './ApType'

export type Cas1PremisesSummary = {
  id: string;
  name: string;
  apCode: string;
  apType: ApType;
  postcode: string;
  apArea: ApArea;
  /**
   * The total number of beds in this premises
   */
  bedCount: number;
  /**
   * The total number of beds available at this moment in time
   */
  availableBeds: number;
  /**
   * The total number of out of service beds at this moment in time
   */
  outOfServiceBeds: number;
  supportsSpaceBookings: boolean;
  managerDetails?: string;
  /**
   * over-bookings for the next 12 weeks
   */
  overbookingSummary: Array<Cas1OverbookingRange>;
};


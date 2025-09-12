/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ProjectAllocationDto = {
    /**
     * Project allocation id
     */
    id: number;
    /**
     * Project name
     */
    projectName: string;
    /**
     * Team id
     */
    teamId: number;
    /**
     * Allocation start date
     */
    startDate: string;
    /**
     * Allocation end date
     */
    endDate: string;
    /**
     * Project code
     */
    projectCode: string;
    /**
     * Number of offenders allocated
     */
    allocated: number;
    /**
     * Number of offenders with outcomes
     */
    outcomes: number;
    /**
     * Number of offenders with enforcements
     */
    enforcements: number;
};


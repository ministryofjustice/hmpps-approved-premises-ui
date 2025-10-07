/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SessionSummaryDto = {
    /**
     * Project allocation id
     */
    id: number;
    projectId: number;
    /**
     * Project name
     */
    projectName: string;
    /**
     * Project code
     */
    projectCode: string;
    /**
     * Allocation date
     */
    date: string;
    /**
     * Allocation start local time
     */
    startTime: string;
    /**
     * Allocation end local time
     */
    endTime: string;
    /**
     * Number of offenders allocated
     */
    numberOfOffendersAllocated: number;
    /**
     * Number of offenders with outcomes
     */
    numberOfOffendersWithOutcomes: number;
    /**
     * Number of offenders with enforcements
     */
    numberOfOffendersWithEA: number;
};


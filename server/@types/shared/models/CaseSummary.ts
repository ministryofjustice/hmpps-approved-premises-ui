/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Manager } from './Manager';
import type { Name } from './Name';
import type { Profile } from './Profile';
export type CaseSummary = {
    crn: string;
    currentExclusion: boolean;
    currentRestriction: boolean;
    dateOfBirth: string;
    gender?: string;
    manager: Manager;
    name: Name;
    nomsId?: string;
    pnc?: string;
    profile?: Profile;
};


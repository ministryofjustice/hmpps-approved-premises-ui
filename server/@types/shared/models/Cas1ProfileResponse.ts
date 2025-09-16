/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApprovedPremisesUser } from './ApprovedPremisesUser';
import type { Cas1LoadError } from './Cas1LoadError';
export type Cas1ProfileResponse = {
    /**
     * The Delius username of the user. This field is mandatory.
     */
    deliusUsername: string;
    /**
     *
     * The potential error encountered while loading the profile,Null if no error occurred.
     *
     */
    loadError?: Cas1LoadError;
    /**
     * The user details. Null if there is an error or user details are unavailable.
     */
    user?: ApprovedPremisesUser;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApArea } from './ApArea';
import type { ApprovedPremisesUserPermission } from './ApprovedPremisesUserPermission';
import type { ApprovedPremisesUserRole } from './ApprovedPremisesUserRole';
import type { User } from './User';
import type { UserQualification } from './UserQualification';
export type ApprovedPremisesUser = (User & {
    qualifications: Array<UserQualification>;
    roles: Array<ApprovedPremisesUserRole>;
    permissions?: Array<ApprovedPremisesUserPermission>;
    apArea: ApArea;
    version?: number;
});


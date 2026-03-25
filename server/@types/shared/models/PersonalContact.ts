/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Address } from './Address';
import type { Name } from './Name';
import type { RelationshipType } from './RelationshipType';
export type PersonalContact = {
    address?: Address;
    mobileNumber?: string;
    name: Name;
    relationship: string;
    relationshipType: RelationshipType;
    telephoneNumber?: string;
};


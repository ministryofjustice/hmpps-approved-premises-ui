/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1ApplicationTimeline } from './Cas1ApplicationTimeline';
import type { FullPerson } from './FullPerson';
import type { RestrictedPerson } from './RestrictedPerson';
import type { UnknownPerson } from './UnknownPerson';
export type Cas1PersonalTimeline = {
    applications: Array<Cas1ApplicationTimeline>;
    person: (FullPerson | RestrictedPerson | UnknownPerson);
};


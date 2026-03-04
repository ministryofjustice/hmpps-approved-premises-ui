/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CaseSummary } from './CaseSummary';
import type { MappaDetail } from './MappaDetail';
import type { Offence } from './Offence';
import type { Registration } from './Registration';
import type { Sentence } from './Sentence';
export type CaseDetail = {
    case: CaseSummary;
    mappaDetail?: MappaDetail;
    offences: Array<Offence>;
    registrations: Array<Registration>;
    sentences: Array<Sentence>;
};


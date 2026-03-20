/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NoteDetail } from './NoteDetail';
export type Registration = {
    code: string;
    description: string;
    riskFlagGroupDescription?: string;
    riskNotes?: string;
    riskNotesDetail: Array<NoteDetail>;
    startDate: string;
};


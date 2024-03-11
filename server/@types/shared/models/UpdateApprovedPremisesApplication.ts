/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { TemporaryApplyApTypeAwaitingApiChange } from './ApType';
import type { ReleaseTypeOption } from './ReleaseTypeOption';
import type { UpdateApplication } from './UpdateApplication';
export type UpdateApprovedPremisesApplication = (UpdateApplication & {
    apType: TemporaryApplyApTypeAwaitingApiChange;
    isInapplicable?: boolean;
    isWomensApplication?: boolean;
    isEmergencyApplication?: boolean;
    targetLocation?: string;
    releaseType?: ReleaseTypeOption;
    arrivalDate?: string;
});


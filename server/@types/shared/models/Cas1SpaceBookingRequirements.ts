/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApType } from './ApType';
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
import type { Gender } from './Gender';
export type Cas1SpaceBookingRequirements = {
    apType: ApType;
    essentialCharacteristics: Array<Cas1SpaceCharacteristic>;
    /**
     * desirable characteristics are not required and will be removed in the future
     * @deprecated
     */
    desirableCharacteristics?: Array<Cas1SpaceCharacteristic>;
    gender: Gender;
};


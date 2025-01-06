/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApType } from './ApType';
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
import type { Gender } from './Gender';
export type Cas1SpaceSearchRequirements = {
    /**
     * Searching on multiple types is not supported, instead use apType. If this is used, the first type wll be matched, and type 'normal' will be ignored
     * @deprecated
     */
    apTypes?: Array<ApType>;
    apType?: ApType;
    spaceCharacteristics?: Array<Cas1SpaceCharacteristic>;
    /**
     * gender is obtained from application's associated gender
     * @deprecated
     */
    genders?: Array<Gender>;
};


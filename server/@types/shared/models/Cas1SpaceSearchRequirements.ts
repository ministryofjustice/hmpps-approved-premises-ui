/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApType } from './ApType';
import type { Cas1SpaceCharacteristic } from './Cas1SpaceCharacteristic';
import type { Gender } from './Gender';
export type Cas1SpaceSearchRequirements = {
    /**
     * Use 'spaceCharacteristics' to filter on premise types
     * @deprecated
     */
    apTypes?: Array<ApType>;
    /**
     * Use 'spaceCharacteristics' to filter on premise types
     * @deprecated
     */
    apType?: ApType;
    spaceCharacteristics?: Array<Cas1SpaceCharacteristic>;
    /**
     * gender is obtained from application's associated gender
     * @deprecated
     */
    genders?: Array<Gender>;
};


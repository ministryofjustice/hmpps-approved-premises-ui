/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AnyValue } from './AnyValue';

export type SubmitApplication = {
    translatedDocument: AnyValue;
    isPipeApplication?: boolean;
    isWomensApplication?: boolean;
    targetLocation?: string;
    releaseType?: 'licence' | 'rotl' | 'hdc' | 'pss';
};


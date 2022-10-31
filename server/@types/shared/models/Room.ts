/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Bed } from './Bed';

export type Room = {
    id: string;
    name: string;
    notes?: string;
    beds?: Array<Bed>;
};


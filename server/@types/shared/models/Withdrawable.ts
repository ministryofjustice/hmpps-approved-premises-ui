/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Cas1WithdrawableDatePeriodDto } from './Cas1WithdrawableDatePeriodDto';
import type { WithdrawableType } from './WithdrawableType';
export type Withdrawable = {
    /**
     * 0, 1 or more dates can be specified depending upon the WithdrawableType
     */
    dates: Array<Cas1WithdrawableDatePeriodDto>;
    id: string;
    type: WithdrawableType;
};


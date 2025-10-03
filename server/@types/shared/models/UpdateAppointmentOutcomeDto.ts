/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AttendanceDataDto } from './AttendanceDataDto';
import type { EnforcementDto } from './EnforcementDto';
export type UpdateAppointmentOutcomeDto = {
    /**
     * The start local time of the appointment
     */
    startTime: string;
    /**
     * The end local time of the appointment
     */
    endTime: string;
    contactOutcomeId: string;
    supervisorOfficerCode: string;
    notes?: string;
    attendanceData?: AttendanceDataDto;
    enforcementData?: EnforcementDto;
};


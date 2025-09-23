/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateAppointmentAttendanceDataDto } from './UpdateAppointmentAttendanceDataDto';
import type { UpdateAppointmentEnforcementDto } from './UpdateAppointmentEnforcementDto';
export type UpdateAppointmentOutcomeDto = {
    projectTypeId: number;
    /**
     * The start local time of the appointment
     */
    startTime: string;
    /**
     * The end local time of the appointment
     */
    endTime: string;
    contactOutcomeId: string;
    supervisorTeamId: number;
    supervisorOfficerId: number;
    notes: string;
    attendanceData?: UpdateAppointmentAttendanceDataDto;
    enforcementData?: UpdateAppointmentEnforcementDto;
};


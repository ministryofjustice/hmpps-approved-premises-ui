/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateAppointmentAttendanceDataDto } from './UpdateAppointmentAttendanceDataDto';
import type { UpdateAppointmentEnforcementDto } from './UpdateAppointmentEnforcementDto';
export type UpdateAppointmentOutcomeDto = {
    projectTypeId: number;
    startTime: string;
    endTime: string;
    contactOutcomeId: string;
    supervisorTeamId: number;
    supervisorOfficerId: number;
    notes: string;
    attendanceData?: UpdateAppointmentAttendanceDataDto;
    enforcementData?: UpdateAppointmentEnforcementDto;
};


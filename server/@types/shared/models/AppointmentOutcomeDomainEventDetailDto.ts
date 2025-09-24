/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AppointmentOutcomeDomainEventDetailDto = {
    id: string;
    appointmentDeliusId: number;
    projectTypeDeliusCode: string;
    /**
     * The start local time of the appointment
     */
    startTime: string;
    /**
     * The end local time of the appointment
     */
    endTime: string;
    contactOutcomeDeliusCode: string;
    supervisorTeamDeliusId: number;
    supervisorOfficerDeliusId: number;
    notes?: string;
    hiVisWorn?: boolean;
    workedIntensively?: boolean;
    penaltyMinutes?: number;
    workQuality?: 'EXCELLENT' | 'GOOD' | 'NOT_APPLICABLE' | 'POOR' | 'SATISFACTORY' | 'UNSATISFACTORY';
    behaviour?: 'EXCELLENT' | 'GOOD' | 'NOT_APPLICABLE' | 'POOR' | 'SATISFACTORY' | 'UNSATISFACTORY';
    enforcementActionDeliusCode?: string;
    respondBy?: string;
};


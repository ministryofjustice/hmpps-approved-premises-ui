declare module '@approved-premises/e2e' {
  export type AppealDecision = 'Appeal successful' | 'Appeal unsuccessful'

  export type ApplicationType = 'standard' | 'emergency' | 'shortNotice'

  type UserLoginDetails = {
    username: string
    password: string
  }

  type UserFullDetails = UserLoginDetails & {
    name: string
    email: string
  }

  export type TestOptions = {
    person: {
      crn: string
      name: string
      tier: string
    }
    personForAdHocBooking: {
      crn: string
    }
    userToAddAndDelete: {
      name: string
    }
    user: UserFullDetails
    futureManager: UserLoginDetails
    cruMember: UserLoginDetails
    administrator: UserLoginDetails
    reportViewer: UserLoginDetails
    assessor: UserFullDetails
    userWithoutRoles: UserLoginDetails
    indexOffenceRequired: boolean
    oasysSections: Array<string>
    emergencyApplicationUser?: string
  }
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/create-offender.mjs' {
  export const createOffender: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/person.mjs' {
  export const deliusPerson: (...args: Array<any>) => any
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/event/create-event.mjs' {
  export const createCustodialEvent: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/registration/create-registration.mjs' {
  export const createRegistration: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/release/create-release.mjs' {
  export const createRelease: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/api/dps/prison-api.mjs' {
  export const createAndBookPrisoner: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/find-offender.mjs' {
  export const findOffenderByCRN: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/inputs.mjs' {
  export const selectOption: (...args: Array<any>) => Promise<any>
  export const fillDateOasys: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/refresh.mjs' {
  export const doUntil: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/sign-and-lock.mjs' {
  export const signAndlock: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/cms-offender-details.mjs' {
  export const clickCreateOffenderButton: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/offender-search.mjs' {
  export const offenderSearchWithCRN: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/set-provider-establishment.mjs' {
  export const setProviderEstablishment: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/task-manager.mjs' {
  export const clickSearch: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/analysis-of-offences-layer3.mjs' {
  export const completeOffenceAnalysisYes: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/cms-search-results.mjs' {
  export const clickCMSRecord: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/create-assessment.mjs' {
  export const clickOffenceAnalysis: (...args: Array<any>) => Promise<any>
  export const clickRiskManagementPlan: (...args: Array<any>) => Promise<any>
  export const clickRoSHSummary: (...args: Array<any>) => Promise<any>
  export const clickRoSHScreeningSection1: (...args: Array<any>) => Promise<any>
  export const clickSection2to13: (...args: Array<any>) => Promise<any>
  export const selfAssessmentForm: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/create-ofender.mjs' {
  export const clickCreateAssessmentButton: (...args: Array<any>) => Promise<any>
  export const clickUpdateOffenderButton: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/crn-amendment.mjs' {
  export const clickOKForCRNAmendment: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/section-1.mjs' {
  export const completeRoSHSection1MarkAllNo: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/section-5.mjs' {
  export const completeRoSHSection5FullAnalysis: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/section-8.mjs' {
  export const completeRoSHSection8FullAnalysisYes: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/login.mjs' {
  export const login: (...args: Array<any>) => Promise<any>
  export const UserType: any
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/create-offender' {
  export const createOffender: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/person' {
  export const deliusPerson: (...args: Array<any>) => any
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/event/create-event' {
  export const createCustodialEvent: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/registration/create-registration' {
  export const createRegistration: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/release/create-release' {
  export const createRelease: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/api/dps/prison-api' {
  export const createAndBookPrisoner: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/find-offender' {
  export const findOffenderByCRN: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/inputs' {
  export const selectOption: (...args: Array<any>) => Promise<any>
  export const fillDateOasys: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/refresh' {
  export const doUntil: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/sign-and-lock' {
  export const signAndlock: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/cms-offender-details' {
  export const clickCreateOffenderButton: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/offender-search' {
  export const offenderSearchWithCRN: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/set-provider-establishment' {
  export const setProviderEstablishment: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/task-manager' {
  export const clickSearch: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/analysis-of-offences-layer3' {
  export const completeOffenceAnalysisYes: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/cms-search-results' {
  export const clickCMSRecord: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/create-assessment' {
  export const clickOffenceAnalysis: (...args: Array<any>) => Promise<any>
  export const clickRiskManagementPlan: (...args: Array<any>) => Promise<any>
  export const clickRoSHSummary: (...args: Array<any>) => Promise<any>
  export const clickRoSHScreeningSection1: (...args: Array<any>) => Promise<any>
  export const clickSection2to13: (...args: Array<any>) => Promise<any>
  export const selfAssessmentForm: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/create-ofender' {
  export const clickCreateAssessmentButton: (...args: Array<any>) => Promise<any>
  export const clickUpdateOffenderButton: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/crn-amendment' {
  export const clickOKForCRNAmendment: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/section-1' {
  export const completeRoSHSection1MarkAllNo: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/section-5' {
  export const completeRoSHSection5FullAnalysis: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/layer3-assessment/section-8' {
  export const completeRoSHSection8FullAnalysisYes: (...args: Array<any>) => Promise<any>
}

declare module '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/oasys/login' {
  export const login: (...args: Array<any>) => Promise<any>
  export const UserType: any
}

/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'notifications-node-client' {
  class NotifyClient {
    constructor(apiKey: string)

    sendEmail(
      templateId: string,
      emailAddress: string,
      options: {
        personalisation: any
        reference: string
        emailReplyToId?: string
      },
    ): Promise<any>

    sendSms(templateId: string, phoneNumber: string, options?: NotificationSendOptions): Promise<any>

    sendLetter(templateId: string, options?: NotificationSendOptions): Promise<any>

    sendPrecompiledLetter(reference: string, pdfFile: string | Buffer, postage?: string): Promise<any>

    getNotificationById(notificationId: string): Promise<any>

    getNotifications(
      templateType?: string,
      status?: string,
      reference?: string,
      olderThanId?: string,
    ): Promise<NotificationResponse>

    getPdfForLetterNotification(notificationId: string): Promise<Buffer>

    getTemplateById(templateId: string): Promise<any>

    getTemplateByIdAndVersion(templateId: string, version: number): Promise<any>

    getAllTemplates(templateType?: string): Promise<any>

    previewTemplateById(templateId: string, personalisation?: any): Promise<any>

    getReceivedTexts(olderThan?: string): Promise<any>

    setProxy(proxyConfig: any): void

    prepareUpload(fileData: any, options?: FileUploadOptions): any
  }

  export interface NotificationSendOptions {
    personalisation?: any
    reference?: string
    emailReplyToId?: string
    smsSenderId?: string
  }

  export interface FileUploadOptions {
    isCsv?: boolean
    confirmEmailBeforeDownload?: boolean
    retentionPeriod?: number
  }

  export interface NotificationResponse {
    data: {
      notifications: Array<Record<string, any>>
    }
  }
}

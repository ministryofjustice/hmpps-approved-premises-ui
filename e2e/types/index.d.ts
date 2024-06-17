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
    }
    userToAddAndDelete: {
      name: string
    }
    user: UserFullDetails
    futureManager: UserLoginDetails
    administrator: UserLoginDetails
    reportViewer: UserLoginDetails
    assessor: UserFullDetails
    userWithoutRoles: UserLoginDetails
    indexOffenceRequired: boolean
    oasysSections: Array<string>
    emergencyApplicationUser?: string
  }
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

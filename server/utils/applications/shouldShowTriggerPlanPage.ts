import { ApprovedPremisesApplication as Application } from '../../@types/shared'
import { noticeTypeFromApplication } from './noticeTypeFromApplication'

export const shouldShowTriggerPlanPages = (application: Application) =>
  noticeTypeFromApplication(application) === 'emergency'

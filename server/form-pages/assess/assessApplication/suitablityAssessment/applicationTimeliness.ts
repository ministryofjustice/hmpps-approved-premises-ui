import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import ReasonForShortNotice, {
  shortNoticeReasons,
} from '../../../apply/reasons-for-placement/basic-information/reasonForShortNotice'
import { DateFormats } from '../../../../utils/dateUtils'
import { ApprovedPremisesAssessment as Assessment } from '../../../../@types/shared'

import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { responsesForYesNoAndCommentsSections } from '../../../utils/index'
import { retrieveOptionalQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'
import Rfap from '../../../apply/risk-and-need-factors/further-considerations/rfap'
import { noticeTypeFromApplication } from '../../../../utils/applications/noticeTypeFromApplication'
import { arrivalDateFromApplication } from '../../../../utils/applications/arrivalDateFromApplication'

export type ApplicationTimelinessSection = {
  agreeWithShortNoticeReason: string
}

export type ApplicationDetails = {
  applicationDate: string
  lateApplicationReason: string
  arrivalDate: string
}

@Page({
  name: 'application-timeliness',
  bodyProperties: ['agreeWithShortNoticeReason', 'agreeWithShortNoticeReasonComments'],
})
export default class ApplicationTimeliness implements TasklistPage {
  name = 'application-timeliness'

  title = 'Application timeliness'

  question = `Do you agree with the applicant's reason for submission within 4 months of expected arrival?`

  applicationDetails: ApplicationDetails

  constructor(
    public body: {
      agreeWithShortNoticeReason: YesOrNo
      agreeWithShortNoticeReasonComments?: string
    },
    private readonly assessment: Assessment,
  ) {
    this.applicationDetails = this.retrieveShortNoticeApplicationDetails()
  }

  retrieveShortNoticeApplicationDetails(): ApplicationDetails {
    const applicationDate = DateFormats.isoDateToUIDate(this.assessment.application.submittedAt, { format: 'short' })
    const lateApplicationReasonId = retrieveOptionalQuestionResponseFromFormArtifact(
      this.assessment.application,
      ReasonForShortNotice,
      'reason',
    )
    const arrivalDate = arrivalDateFromApplication(this.assessment.application)

    const lateApplicationReason = lateApplicationReasonId
      ? shortNoticeReasons[lateApplicationReasonId]
      : 'None supplied'

    return {
      applicationDate,
      lateApplicationReason,
      arrivalDate: arrivalDate ? DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }) : 'None supplied',
    }
  }

  previous() {
    const needsRfap = retrieveOptionalQuestionResponseFromFormArtifact(this.assessment.application, Rfap, 'needARfap')

    if (needsRfap === 'yes') {
      return 'rfap-suitability'
    }

    return 'suitability-assessment'
  }

  next() {
    return noticeTypeFromApplication(this.assessment.application) === 'emergency' ? 'contingency-plan-suitability' : ''
  }

  response() {
    return responsesForYesNoAndCommentsSections({ agreeWithShortNoticeReason: this.question }, this.body)
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.agreeWithShortNoticeReason)
      errors.agreeWithShortNoticeReason = `You must confirm if you agree with the applicant's reason for submission within 4 months of expected arrival`

    if (this.body.agreeWithShortNoticeReason === 'no' && !this.body.agreeWithShortNoticeReasonComments) {
      errors.agreeWithShortNoticeReasonComments = 'You must provide details to support the decision'
    }

    return errors
  }
}

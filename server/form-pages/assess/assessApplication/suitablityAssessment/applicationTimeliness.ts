import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import ReasonForShortNotice, {
  shortNoticeReasons,
} from '../../../apply/reasons-for-placement/basic-information/reasonForShortNotice'
import { DateFormats } from '../../../../utils/dateUtils'
import { ApprovedPremisesAssessment as Assessment } from '../../../../@types/shared'

import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { responsesForYesNoAndCommentsSections } from '../../../utils/index'
import { retrieveQuestionResponseFromFormArtifact } from '../../../../utils/retrieveQuestionResponseFromFormArtifact'

export type ApplicationTimelinessSection = {
  agreeWithShortNoticeReason: string
}

@Page({
  name: 'application-timeliness',
  bodyProperties: ['agreeWithShortNoticeReason', 'agreeWithShortNoticeReasonComments'],
})
export default class ApplicationTimeliness implements TasklistPage {
  name = 'application-timeliness'

  title = 'Application timeliness'

  question = `Do you agree with the applicant's reason for submission within 4 months of expected arrival?`

  applicationDetails: unknown

  constructor(
    public body: {
      agreeWithShortNoticeReason: YesOrNo
      agreeWithShortNoticeReasonComments?: string
    },
    private readonly assessment: Assessment,
  ) {
    this.applicationDetails = this.retrieveShortNoticeApplicationDetails()
  }

  retrieveShortNoticeApplicationDetails() {
    const applicationDate = DateFormats.isoDateToUIDate(this.assessment.application.submittedAt, { format: 'short' })
    const lateApplicationReasonId = retrieveQuestionResponseFromFormArtifact(
      this.assessment.application,
      ReasonForShortNotice,
      'reason',
    )
    const lateApplicationReason = shortNoticeReasons[lateApplicationReasonId]

    return { applicationDate, lateApplicationReason }
  }

  previous() {
    return 'suitability-assessment'
  }

  next() {
    return ''
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

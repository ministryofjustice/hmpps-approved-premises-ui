import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

import AssessPage from './assessPage'

export default class ApplicationTimelinessPage extends AssessPage {
  constructor(assessment: Assessment) {
    super('Application timeliness', assessment, 'suitability-assessment', 'application-timeliness', '')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('agreeWithShortNoticeReason')
    this.completeTextInputFromPageBody('agreeWithShortNoticeReasonComments')
    if (this.tasklistPage.body.agreeWithShortNoticeReason === 'no') {
      this.selectSelectOptionFromPageBody('reasonForLateApplication')
    }
  }
}

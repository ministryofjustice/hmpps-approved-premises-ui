import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

import AssessPage from './assessPage'

import ApplicationTimeliness from '../../../server/form-pages/assess/assessApplication/suitablityAssessment/applicationTimeliness'

export default class ApplicationTimelinessPage extends AssessPage {
  pageClass = new ApplicationTimeliness(
    {
      agreeWithShortNoticeReason: 'no',
      agreeWithShortNoticeReasonComments: 'some reason',
      reasonForLateApplication: 'onBail',
    },
    this.assessment,
  )

  constructor(assessment: Assessment) {
    super(assessment, 'Application timeliness')
  }

  completeForm() {
    this.checkRadioByNameAndValue('agreeWithShortNoticeReason', this.pageClass.body.agreeWithShortNoticeReason)
    this.completeTextArea('agreeWithShortNoticeReasonComments', 'One')
    this.getSelectInputByIdAndSelectAnEntry('reasonForLateApplication', 'onBail')
  }
}

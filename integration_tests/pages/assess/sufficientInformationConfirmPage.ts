import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import type { YesOrNo } from '@approved-premises/ui'

import AssessPage from './assessPage'

import SufficientInformationConfirm from '../../../server/form-pages/assess/reviewApplication/sufficientInformation/sufficientInformationConfirm'

export default class SufficientInformationConfirmPage extends AssessPage {
  pageClass: SufficientInformationConfirm

  constructor(assessment: Assessment, answer: YesOrNo = 'yes') {
    super('Suitability Assessment', assessment, 'sufficient-information', 'sufficient-information-confirm', '')
    this.pageClass = new SufficientInformationConfirm({ confirm: answer }, assessment)
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('confirm')
  }
}

import type { Cas1Assessment as Assessment } from '@approved-premises/api'

import AssessPage from './assessPage'

export default class SufficientInformationConfirmPage extends AssessPage {
  constructor(assessment: Assessment) {
    super('Suitability Assessment', assessment, 'sufficient-information', 'sufficient-information-confirm', '')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('confirm')
  }
}

import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

import AssessPage from './assessPage'

import InformationReceived from '../../../server/form-pages/assess/reviewApplication/sufficientInformation/informationReceived'

export default class InformationReceivedPage extends AssessPage {
  constructor(assessment: Assessment) {
    super('Additional information', assessment, 'sufficient-information', 'information-received')
  }

  completeForm() {
    this.checkRadioButtonFromPageBody('informationReceived')
    if (this.tasklistPage.body.informationReceived === 'yes') {
      this.clearAndCompleteTextInputById('response', (this.tasklistPage as InformationReceived).body.response)
      this.clearDateInputs('responseReceivedOn')
      this.completeDateInputsFromPageBody('responseReceivedOn')
    }
  }

  addNote() {
    this.completeTextInputFromPageBody('query')
  }
}

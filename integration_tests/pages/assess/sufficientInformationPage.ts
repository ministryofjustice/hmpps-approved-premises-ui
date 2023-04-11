import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'
import type { YesOrNo } from '@approved-premises/ui'

import AssessPage from './assessPage'

import SufficientInformation from '../../../server/form-pages/assess/reviewApplication/sufficientInformation/sufficientInformation'

export default class SufficientInformationPage extends AssessPage {
  pageClass: SufficientInformation

  constructor(assessment: Assessment, answer: YesOrNo = 'yes') {
    super(assessment, 'Sufficient information')
    this.pageClass = new SufficientInformation({ sufficientInformation: answer })
  }

  completeForm() {
    this.checkRadioByNameAndValue('sufficientInformation', this.pageClass.body.sufficientInformation)
  }

  addNote(note: string) {
    this.completeTextArea('query', note)
  }
}

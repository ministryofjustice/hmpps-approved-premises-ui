import type { ApprovedPremisesAssessment as Assessment } from '@approved-premises/api'

import AssessPage from './assessPage'

import SufficientInformation from '../../../server/form-pages/assess/reviewApplication/suitabilityAssessment/sufficientInformation'

export default class SufficientInformationPage extends AssessPage {
  pageClass = new SufficientInformation({ sufficientInformation: 'yes' })

  constructor(assessment: Assessment) {
    super(assessment, 'Suitability Assessment')
  }

  completeForm() {
    this.checkRadioByNameAndValue('sufficientInformation', this.pageClass.body.sufficientInformation)
  }
}

import { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class DescribeLocationFactors extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super('Location factors', application, 'location-factors', 'describe-location-factors')
  }

  completeForm(): void {
    this.completeTextInputFromPageBody('postcodeArea')
    this.completeTextInputFromPageBody('positiveFactors')
    this.checkRadioButtonFromPageBody('restrictions')
    this.completeTextInputFromPageBody('restrictionDetail')
    this.checkRadioButtonFromPageBody('alternativeRadiusAccepted')
    this.selectSelectOptionFromPageBody('alternativeRadius')
    this.checkRadioButtonFromPageBody('differentPDU')
  }
}

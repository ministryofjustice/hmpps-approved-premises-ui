import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class DescribeLocationFactors extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'Location factors',
      application,
      'location-factors',
      'describe-location-factors',
      paths.applications.show({ id: application.id }),
    )
  }

  completeForm(): void {
    this.completeTextInputFromPageBody('postcodeArea')
    this.completeTextInputFromPageBody('positiveFactors')
    this.checkRadioButtonFromPageBody('restrictions')
    this.completeTextInputFromPageBody('restrictionDetail')
    this.checkRadioButtonFromPageBody('alternativeRadiusAccepted')
    this.selectSelectOptionFromPageBody('alternativeRadius')
  }
}

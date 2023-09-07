import { ApprovedPremisesApplication } from '@approved-premises/api'
import ApplyPage from './applyPage'

export default class EsapPlacementScreening extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      `Why does the person require an enhanced security placement?`,
      application,
      'type-of-ap',
      'esap-placement-screening',
    )
  }

  completeForm() {
    this.checkCheckboxesFromPageBody('esapReasons')
  }
}

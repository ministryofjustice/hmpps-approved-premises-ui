import { Cas1Application } from '@approved-premises/api'
import ApplyPage from './applyPage'

export default class EsapPlacementScreening extends ApplyPage {
  constructor(application: Cas1Application) {
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

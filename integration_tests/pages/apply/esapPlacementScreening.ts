import { ApprovedPremisesApplication } from '@approved-premises/api'
import ApplyPage from './applyPage'
import { nameOrPlaceholderCopy } from '../../../server/utils/personUtils'

export default class EsapPlacementScreening extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      `Why does ${nameOrPlaceholderCopy(application.person)} require an enhanced security placement?`,
      application,
      'type-of-ap',
      'esap-placement-screening',
    )
  }

  completeForm() {
    this.checkCheckboxesFromPageBody('esapReasons')
  }
}

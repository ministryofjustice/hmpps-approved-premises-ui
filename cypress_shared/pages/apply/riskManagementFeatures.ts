import { ApprovedPremisesApplication } from '@approved-premises/api'
import paths from '../../../server/paths/apply'

import ApplyPage from './applyPage'

export default class RiskManagementFeatures extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'What features of an AP will support the management of risk?',
      application,
      'risk-management-features',
      'risk-management-features',
      paths.applications.show({ id: application.id }),
    )
  }

  enterRiskManagementDetails() {
    this.completeTextInputFromPageBody('manageRiskDetails')
  }

  enterAdditionalFeaturesDetails() {
    this.completeTextInputFromPageBody('additionalFeaturesDetails')
  }

  completeForm() {
    this.enterRiskManagementDetails()
    this.enterAdditionalFeaturesDetails()
  }
}

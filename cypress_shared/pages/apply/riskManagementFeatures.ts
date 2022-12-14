import { ApprovedPremisesApplication } from '@approved-premises/api'

import ApplyPage from './applyPage'

export default class RiskManagementFeatures extends ApplyPage {
  constructor(application: ApprovedPremisesApplication) {
    super(
      'What features of AP will support the management of risk?',
      application,
      'risk-management-features',
      'risk-management-features',
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

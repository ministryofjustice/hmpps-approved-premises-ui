import { faker } from '@faker-js/faker'

import Page from '../page'

export default class RiskManagementFeatures extends Page {
  constructor() {
    super('What features of AP will support the management of risk?')
  }

  enterRiskManagementDetails() {
    this.getTextInputByIdAndEnterDetails('manageRiskDetails', faker.lorem.words())
  }

  enterAdditionalFeaturesDetails() {
    this.getTextInputByIdAndEnterDetails('additionalFeaturesDetails', faker.lorem.words())
  }

  completeForm() {
    this.enterRiskManagementDetails()
    this.enterAdditionalFeaturesDetails()
  }
}

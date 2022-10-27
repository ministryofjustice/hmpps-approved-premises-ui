import { faker } from '@faker-js/faker'

import Page from '../page'

export default class RiskManagementFeatures extends Page {
  constructor() {
    super('What features of AP will support the management of risk?')
  }

  enterRiskManagementDetails() {
    this.getTextInputByIdAndEnterDetails('more-detail', faker.lorem.sentence())
  }

  enterAdditionalFeaturesDetails() {
    this.getTextInputByIdAndEnterDetails('additional-features-detail', faker.lorem.sentence())
  }

  completeForm() {
    this.enterRiskManagementDetails()
    this.enterAdditionalFeaturesDetails()
  }
}

import type { ApprovedPremisesApplication } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'

import TasklistPage from '../../../tasklistPage'
import { Page } from '../../../utils/decorators'

@Page({ name: 'risk-management-features', bodyProperties: ['manageRiskDetails', 'additionalFeaturesDetails'] })
export default class RiskManagementFeatures implements TasklistPage {
  title = `How will an Approved Premises (AP) placement support the management of risk?`

  questions = {
    manageRiskDetails: `Describe why an AP placement is needed to manage the risk of ${this.application.person.name}`,
    additionalFeaturesDetails:
      'Provide details of any additional measures that will be necessary for the management of risk',
  }

  constructor(
    public body: { manageRiskDetails?: string; additionalFeaturesDetails?: string },
    private readonly application: ApprovedPremisesApplication,
  ) {}

  previous() {
    return 'dashboard'
  }

  next() {
    return 'convicted-offences'
  }

  response() {
    return {
      [this.questions.manageRiskDetails]: this.body.manageRiskDetails,
      [this.questions.additionalFeaturesDetails]: this.body.additionalFeaturesDetails,
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.manageRiskDetails) {
      errors.manageRiskDetails = `You must describe why an AP placement is needed to manage the risk of ${this.application.person.name}`
    }

    return errors
  }
}

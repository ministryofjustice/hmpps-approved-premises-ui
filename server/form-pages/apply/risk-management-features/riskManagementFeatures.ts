import type { Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'

import TasklistPage from '../../tasklistPage'

export default class RiskManagementFeatures implements TasklistPage {
  name = 'risk-management-features'

  title = `How will an Approved Premises (AP) placement support the management of risk?`

  body: { manageRiskDetails: string; additionalFeatures: string }

  questions = {
    manageRiskDetails: `Describe why an AP placement is needed to manage the risk of ${this.application.person.name}`,
    additionalFeatures: 'Provide details of any additional measures that will be necessary for the management of risk',
  }

  constructor(body: Record<string, unknown>, private readonly application: Application) {
    this.body = {
      manageRiskDetails: body.manageRiskDetails as string,
      additionalFeatures: body.additionalFeatures as string,
    }
  }

  previous() {
    return ''
  }

  next() {
    return ''
  }

  response() {
    return {
      [this.title]: {
        [this.questions.manageRiskDetails]: this.body.manageRiskDetails,
        [this.questions.additionalFeatures]: this.body.additionalFeatures,
      },
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

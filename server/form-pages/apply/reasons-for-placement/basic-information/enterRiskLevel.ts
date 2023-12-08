import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

const riskLevels = {
  veryHighRisk: 'Very high risk',
  highRisk: 'High risk',
  medium: 'Medium with complex needs',
} as const

export type RiskLevelT = keyof typeof riskLevels

type Body = {
  riskLevel?: RiskLevelT
}

@Page({
  name: 'enter-risk-level',
  bodyProperties: ['riskLevel'],
})
export default class EnterRiskLevel implements TasklistPage {
  title = "We cannot check this person's tier"

  question = "What is the person's risk level?"

  riskLevels = riskLevels

  riskLevel: RiskLevelT

  constructor(public body: Body) {
    this.riskLevel = body.riskLevel
  }

  previous() {
    return ''
  }

  next() {
    if (this.body.riskLevel === 'highRisk' || this.body.riskLevel === 'veryHighRisk') {
      return 'is-exceptional-case'
    }

    return 'not-eligible'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.riskLevel) {
      errors.riskLevel = 'You must state the risk level'
    }

    return errors
  }

  response() {
    return {
      [this.question]: riskLevels[this.body.riskLevel],
    }
  }
}

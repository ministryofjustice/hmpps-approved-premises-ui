import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../../utils/decorators'
import TasklistPage from '../../../../tasklistPage'

@Page({ name: 'risk-to-residents', bodyProperties: ['riskToResidentsSummary'] })
export default class RiskToResidents implements TasklistPage {
  name = 'risk-to-residents'

  title = 'Risk to other residents'

  question = this.title

  constructor(public body: { riskToResidentsSummary?: string }) {}

  previous() {
    return 'risk-to-staff'
  }

  next() {
    return ''
  }

  response() {
    return { [this.question]: this.body.riskToResidentsSummary }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.riskToResidentsSummary)
      errors.riskToResidentsSummary = 'You must enter a summary of the risk to other residents'
    return errors
  }
}

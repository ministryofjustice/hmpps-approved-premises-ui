import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../../utils/decorators'
import TasklistPage from '../../../../tasklistPage'

@Page({ name: 'risk-to-staff', bodyProperties: ['riskToStaffSummary'] })
export default class RiskToStaff implements TasklistPage {
  name = 'risk-to-staff'

  title = 'Risk to staff'

  question = this.title

  constructor(public body: { riskToStaffSummary?: string }) {}

  previous() {
    return ''
  }

  next() {
    return 'risk-to-residents'
  }

  response() {
    return { [this.question]: this.body.riskToStaffSummary }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.riskToStaffSummary) errors.riskToStaffSummary = 'You must enter a summary of the risk to staff'
    return errors
  }
}

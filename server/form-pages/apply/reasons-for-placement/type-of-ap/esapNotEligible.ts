import { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

@Page({ name: 'not-esap-eligible', bodyProperties: ['esapNotEligible'] })
export default class EsapNotEligible implements TasklistPage {
  title = `The person is not eligible for an Enhanced Security Approved Premises (ESAP) placement.`

  constructor(
    readonly body: Partial<{
      esapNotEligible: never
    }>,
    readonly application: Application,
  ) {}

  response() {
    return {}
  }

  previous() {
    return 'esap-exceptional-case'
  }

  next() {
    return ''
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    errors.esapNotEligible = this.title

    return errors
  }
}

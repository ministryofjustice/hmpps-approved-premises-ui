import { ApprovedPremisesApplication as Application } from '@approved-premises/api'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { nameOrPlaceholderCopy } from '../../../../utils/personUtils'

@Page({ name: 'not-esap-eligible', bodyProperties: [] })
export default class EsapNotEligible implements TasklistPage {
  title = `${nameOrPlaceholderCopy(
    this.application.person,
  )} is not eligible for an Enhanced Security Approved Premises (ESAP) placement.`

  constructor(
    readonly body: Record<string, never>,
    readonly application: Application,
  ) {}

  response() {
    return {}
  }

  previous() {
    return 'esap-exceptional-case'
  }

  next() {
    return 'ap-type'
  }

  errors() {
    return {}
  }
}

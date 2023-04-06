import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { ApprovedPremisesApplication } from '@approved-premises/api'
import { sentenceCase } from '../../../../utils/utils'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

type EsapNationalSecurityDivisionBody = {
  managedByNationalSecurityDivision: YesOrNo
}

@Page({
  name: 'managed-by-national-security-division',
  bodyProperties: ['managedByNationalSecurityDivision'],
})
export default class EsapNationalSecurityDivision implements TasklistPage {
  title = `Is ${this.application.person.name} managed by the National Security Division?`

  constructor(
    public body: Partial<EsapNationalSecurityDivisionBody>,
    private readonly application: ApprovedPremisesApplication,
  ) {}

  response() {
    return { [this.title]: sentenceCase(this.body.managedByNationalSecurityDivision) }
  }

  previous() {
    return 'ap-type'
  }

  next() {
    return 'esap-placement-screening'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.managedByNationalSecurityDivision) {
      errors.managedByNationalSecurityDivision = `You must state if ${this.application.person.name} is managed by the National Security Division`
    }

    return errors
  }
}

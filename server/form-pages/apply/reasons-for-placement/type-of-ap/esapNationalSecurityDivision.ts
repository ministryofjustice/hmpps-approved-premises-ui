import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
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
  title = `Is the person managed by the National Security Division?`

  constructor(public body: Partial<EsapNationalSecurityDivisionBody>) {}

  response() {
    return { [this.title]: sentenceCase(this.body.managedByNationalSecurityDivision) }
  }

  previous() {
    return 'ap-type'
  }

  next() {
    if (this.body.managedByNationalSecurityDivision === 'yes') {
      return 'esap-placement-screening'
    }
    return 'esap-exceptional-case'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.managedByNationalSecurityDivision) {
      errors.managedByNationalSecurityDivision = `You must state if the person is managed by the National Security Division`
    }

    return errors
  }
}

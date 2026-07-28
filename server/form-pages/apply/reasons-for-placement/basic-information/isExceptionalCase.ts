import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Cas1Application as Application, FullPerson } from '@approved-premises/api'
import { sentenceCase } from '../../../../utils/utils'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

@Page({ name: 'is-exceptional-case', bodyProperties: ['isExceptionalCase'] })
export default class IsExceptionalCase implements TasklistPage {
  title = 'Is this an exceptional case?'

  tier: string

  constructor(
    readonly body: { isExceptionalCase?: YesOrNo },
    readonly application: Application,
  ) {
    const person = this.application?.person as FullPerson
    this.tier = person?.tier?.tierScore
  }

  response() {
    return { [this.title]: sentenceCase(this.body.isExceptionalCase) }
  }

  previous() {
    return 'dashboard'
  }

  next() {
    if (this.body.isExceptionalCase === 'yes') {
      return 'exception-details'
    }
    return 'not-eligible'
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.isExceptionalCase) {
      errors.isExceptionalCase = 'You must state if this application is an exceptional case'
    }

    return errors
  }
}

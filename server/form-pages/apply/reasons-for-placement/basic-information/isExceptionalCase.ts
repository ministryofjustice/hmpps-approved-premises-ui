import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Cas1Application as Application } from '@approved-premises/api'
import { sentenceCase } from '../../../../utils/utils'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { displayName, getVersionedTierValue } from '../../../../utils/personUtils'

@Page({ name: 'is-exceptional-case', bodyProperties: ['isExceptionalCase'] })
export default class IsExceptionalCase implements TasklistPage {
  title: string

  tier: string

  question = 'Has a senior manager agreed that this is an exceptional case?'

  constructor(
    readonly body: { isExceptionalCase?: YesOrNo },
    readonly application: Application,
  ) {
    this.tier = getVersionedTierValue(application.person, application.risks?.tier?.value)
    this.title = `${displayName(application.person)} is not normally eligible for an AP placement`
  }

  response() {
    return { [this.question]: sentenceCase(this.body.isExceptionalCase) }
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
      errors.isExceptionalCase = 'Select yes if a senior manager has agreed that this is an exceptional case'
    }

    return errors
  }
}

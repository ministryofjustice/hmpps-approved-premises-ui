import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'

import TasklistPage from '../../tasklistPage'
import { Page } from '../../utils/decorators'
import { sentenceCase } from '../../../utils/utils'

@Page({ name: 'same-ap', bodyProperties: ['sameAp'] })
export default class SameAp implements TasklistPage {
  question = 'Do you want this person to stay in the same Approved Premises (AP)?'

  title = this.question

  hint = 'Placement in this AP is not guaranteed.'

  constructor(public body: { sameAp?: YesOrNo }) {}

  previous() {
    return 'previous-rotl-placement'
  }

  next() {
    return ''
  }

  response() {
    return { [this.question]: sentenceCase(this.body.sameAp) }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.sameAp) errors.sameAp = 'You must state whether you want this person to stay in the same AP'

    return errors
  }
}

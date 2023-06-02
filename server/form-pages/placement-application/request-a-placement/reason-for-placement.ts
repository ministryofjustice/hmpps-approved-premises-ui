import type { TaskListErrors } from '@approved-premises/ui'

import TasklistPage from '../../tasklistPage'
import { Page } from '../../utils/decorators'

const reasons = {
  paroleBoard: 'Release directed following parole board or other hearing/decision',
  rotl: 'Release on Temporary Licence (ROTL)',
  existingApplication: 'An additional placement on an existing application',
} as const

type Reason = keyof typeof reasons

@Page({ name: 'reason-for-placement', bodyProperties: ['reason'] })
export default class ReasonForPlacement implements TasklistPage {
  title = 'Request a placement'

  question = 'Why are you requesting a placement?'

  reasons = reasons

  constructor(public body: { reason?: Reason }) {}

  previous() {
    return ''
  }

  next() {
    return ''
  }

  response() {
    return { [this.question]: this.reasons[this.body.reason] }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.reason) errors.reason = 'You must state the reason for placement'

    return errors
  }
}

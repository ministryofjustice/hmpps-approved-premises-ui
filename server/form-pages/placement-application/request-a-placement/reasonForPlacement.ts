import type { TaskListErrors } from '@approved-premises/ui'
import type { PlacementType } from '@approved-premises/api'

import TasklistPage from '../../tasklistPage'
import { Page } from '../../utils/decorators'

const reasons: Record<PlacementType, string> = {
  release_following_decision: 'Release directed following parole board or other hearing/decision',
  rotl: 'Release on Temporary Licence (ROTL)',
  additional_placement: 'An additional placement on an existing application',
}

@Page({ name: 'reason-for-placement', bodyProperties: ['reason'] })
export default class ReasonForPlacement implements TasklistPage {
  title = 'Reason for placement'

  question = 'Why are you requesting a placement?'

  reasons = reasons

  constructor(public body: { reason?: PlacementType }) {}

  previous() {
    return ''
  }

  next() {
    return this.body.reason === 'rotl' ? 'previous-rotl-placement' : 'additional-placement-details'
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

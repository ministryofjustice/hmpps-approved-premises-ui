import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'
import { sentenceCase } from '../../../../utils/utils'

export type RfapBody = { needARfap: YesOrNo }
@Page({
  name: 'rfap',
  bodyProperties: ['needARfap'],
})
export default class Rfap implements TasklistPage {
  name = 'rfap'

  title = 'Recovery Focused Approved Premises (RFAP)'

  question = 'Does this person need a RFAP?'

  constructor(public body: Partial<RfapBody>) {}

  previous() {
    return 'previous-placements'
  }

  next() {
    return this.body.needARfap === 'yes' ? 'rfap-details' : 'catering'
  }

  response() {
    return { [this.question]: sentenceCase(this.body.needARfap) }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.needARfap) {
      errors.needARfap = 'You must state if this person needs a RFAP'
    }

    return errors
  }
}

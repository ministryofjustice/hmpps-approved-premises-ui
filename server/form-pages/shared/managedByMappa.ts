import type { TaskListErrors, YesOrNo } from '@approved-premises/ui'
import { Page } from '../utils/decorators'

import TasklistPage from '../tasklistPage'
import { sentenceCase } from '../../utils/utils'

@Page({ name: 'managed-by-mappa', bodyProperties: ['managedByMappa'] })
export default class ManagedByMappa implements TasklistPage {
  question = 'Is the person managed by MAPPA?'

  title = this.question

  constructor(public body: { managedByMappa: YesOrNo }) {}

  previous() {
    return 'sentence-type'
  }

  next(): string {
    return this.body.managedByMappa === 'yes' ? 'release-date' : 'sentence-type'
  }

  response() {
    return {
      [this.question]: sentenceCase(this.body.managedByMappa),
    }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.managedByMappa) {
      errors.managedByMappa = 'You must specify if the person is managed by MAPPA'
    }

    return errors
  }
}

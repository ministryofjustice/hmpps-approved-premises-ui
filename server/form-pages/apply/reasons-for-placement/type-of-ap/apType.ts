import type { TaskListErrors } from '@approved-premises/ui'

import { TemporaryApplyApTypeAwaitingApiChange } from '@approved-premises/api'
import TasklistPage from '../../../tasklistPage'
import { convertKeyValuePairToRadioItems } from '../../../../utils/formUtils'
import { Page } from '../../../utils/decorators'

const apTypes: Record<TemporaryApplyApTypeAwaitingApiChange, string> = {
  standard: 'Standard AP',
  pipe: 'Psychologically Informed Planned Environment (PIPE)',
  esap: 'Enhanced Security AP (ESAP)',
} as const

@Page({ name: 'ap-type', bodyProperties: ['type'] })
export default class SelectApType implements TasklistPage {
  title = `Which type of AP does the person require?`

  constructor(public body: { type?: TemporaryApplyApTypeAwaitingApiChange }) {}

  previous() {
    return 'dashboard'
  }

  next() {
    if (this.body.type === 'pipe') {
      return 'pipe-referral'
    }
    if (this.body.type === 'esap') {
      return 'managed-by-national-security-division'
    }

    return ''
  }

  response() {
    return { [`${this.title}`]: apTypes[this.body.type] }
  }

  errors() {
    const errors: TaskListErrors<this> = {}

    if (!this.body.type) {
      errors.type = 'You must specify an AP type'
    }

    return errors
  }

  items() {
    return convertKeyValuePairToRadioItems(apTypes, this.body.type)
  }
}

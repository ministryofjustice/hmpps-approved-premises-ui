import type { ApprovedPremisesApplication } from '@approved-premises/api'
import type { TaskListErrors } from '@approved-premises/ui'

import TasklistPage from '../../../tasklistPage'
import { convertKeyValuePairToRadioItems } from '../../../../utils/formUtils'
import { Page } from '../../../utils/decorators'

const apTypes = {
  standard: 'Standard AP',
  pipe: 'Psychologically Informed Planned Environment (PIPE)',
  esap: 'Enhanced Security AP (ESAP)',
} as const

export type ApTypes = typeof apTypes
export type ApType = keyof ApTypes

@Page({ name: 'ap-type', bodyProperties: ['type'] })
export default class SelectApType implements TasklistPage {
  title = `Which type of AP does ${this.application.person.name} require?`

  constructor(
    public body: { type?: ApType },
    private readonly application: ApprovedPremisesApplication,
  ) {}

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

    return null
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

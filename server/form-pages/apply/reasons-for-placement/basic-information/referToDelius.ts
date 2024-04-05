/* istanbul ignore file */
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

@Page({ name: 'refer-to-delius', bodyProperties: [] })
export default class ReferToDelius implements TasklistPage {
  title = 'Refer to NDelius to complete an Approved Premises (AP) application'

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(public readonly body: Record<string, unknown>) {}

  previous() {
    return ''
  }

  next() {
    return ''
  }

  response() {
    return {}
  }

  errors() {
    return {}
  }
}

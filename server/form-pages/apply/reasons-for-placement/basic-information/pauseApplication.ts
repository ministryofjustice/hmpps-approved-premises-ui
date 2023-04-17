/* istanbul ignore file */
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

@Page({ name: 'pause-application', bodyProperties: [] })
export default class PauseApplication implements TasklistPage {
  title = 'Application paused'

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

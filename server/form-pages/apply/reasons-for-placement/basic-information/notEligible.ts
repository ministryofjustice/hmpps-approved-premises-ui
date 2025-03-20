/* istanbul ignore file */
import { Page } from '../../../utils/decorators'

import TasklistPage from '../../../tasklistPage'

@Page({ name: 'not-eligible', bodyProperties: [] })
export default class NotEligible implements TasklistPage {
  title = 'This application is not eligible'

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

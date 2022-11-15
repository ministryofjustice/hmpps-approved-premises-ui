import type { TaskListErrors } from '@approved-premises/ui'
import type { Application } from '@approved-premises/api'

import TasklistPage from '../../tasklistPage'

export default class Review implements TasklistPage {
  name = 'review'

  title = 'Check your answers'

  body: { reviewed: boolean }

  constructor(body: Record<string, unknown>, readonly application: Application) {
    this.body = {
      reviewed: body.reviewed as boolean,
    }
  }

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
    const errors: TaskListErrors<this> = {}

    return errors
  }
}
